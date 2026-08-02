/**
 * Open-Meteo client + the producer that feeds the event bus.
 *
 * Honest note on "live": Open-Meteo is a plain REST API with no push
 * channel, and its `current` block carries `interval: 900`, so upstream
 * data only changes every ~15 minutes. So this is a poller, not a
 * firehose. We poll every 60s for board responsiveness and publish only
 * when a value actually changed, which keeps the flaps from flipping to
 * announce identical data.
 *
 * One request covers all twelve regions (Open-Meteo accepts comma-joined
 * coordinates and returns an array in input order), so a 60s cadence is
 * ~1,440 requests/day against a free tier that allows far more.
 */

import { REGIONS } from "@/lib/regions";
import { bus, WEATHER_TOPIC } from "@/lib/streaming/bus";
import { britishVerdict, describeWmo } from "@/lib/weather/wmo";

export type Observation = {
  regionSlug: string;
  regionName: string;
  boardName: string;
  city: string;
  /**
   * Observation time in epoch seconds.
   *
   * We ask Open-Meteo for `timeformat=unixtime` on purpose. Its default
   * (`2026-07-29T20:30`) carries no UTC offset, so `new Date(...)` would
   * read it in the *viewer's* zone and compute staleness wrongly for
   * anyone outside the UK. Epoch seconds are unambiguous everywhere.
   */
  observedAtEpoch: number;
  tempC: number;
  windKph: number;
  weatherCode: number;
  conditionLabel: string;
  conditionGlyph: string;
  verdict: string;
  isDay: boolean;
};

const POLL_MS = 60_000;

type OpenMeteoEntry = {
  current?: {
    /** Epoch seconds, because we request `timeformat=unixtime`. */
    time: number;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
};

function endpoint(): string {
  const lats = REGIONS.map((r) => r.lat).join(",");
  const lons = REGIONS.map((r) => r.lon).join(",");
  const params = new URLSearchParams({
    latitude: lats,
    longitude: lons,
    current: "temperature_2m,weather_code,wind_speed_10m,is_day",
    wind_speed_unit: "kmh",
    timezone: "Europe/London",
    // Unambiguous timestamps; see the note on Observation.observedAtEpoch.
    timeformat: "unixtime",
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export async function fetchObservations(): Promise<Observation[]> {
  const res = await fetch(endpoint(), {
    // Never let Next's data cache sit in front of a liveness poll.
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo responded ${res.status}`);
    }

  const payload: unknown = await res.json();
  // A single-coordinate request returns an object; multi returns an array.
  const entries: OpenMeteoEntry[] = Array.isArray(payload)
    ? (payload as OpenMeteoEntry[])
    : [payload as OpenMeteoEntry];

  const observations: Observation[] = [];

  entries.forEach((entry, index) => {
    const region = REGIONS[index];
    const current = entry?.current;
    // Skip rather than fabricate: a gap is better than an invented reading.
    if (!region || !current) return;

    const descriptor = describeWmo(current.weather_code);
    observations.push({
      regionSlug: region.slug,
      regionName: region.name,
      boardName: region.boardName,
      city: region.city,
      observedAtEpoch: current.time,
      tempC: Math.round(current.temperature_2m),
      windKph: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      conditionLabel: descriptor.label,
      conditionGlyph: descriptor.glyph,
      verdict: britishVerdict(current.weather_code, current.temperature_2m),
      isDay: current.is_day === 1,
    });
  });

  return observations;
}

/** Fields whose change is worth a board flip. */
function fingerprint(o: Observation): string {
  return `${o.tempC}|${o.windKph}|${o.weatherCode}|${o.observedAtEpoch}`;
}

type PollerState = {
  timer: ReturnType<typeof setInterval> | null;
  lastSeen: Map<string, string>;
  starting: Promise<void> | null;
};

const globalForPoller = globalThis as unknown as {
  __ukAtlasPoller?: PollerState;
};

const state: PollerState = (globalForPoller.__ukAtlasPoller ??= {
  timer: null,
  lastSeen: new Map(),
  starting: null,
});

async function tick(): Promise<void> {
  let observations: Observation[];
  try {
    observations = await fetchObservations();
  } catch (error) {
    // Upstream hiccups are expected. Keep the poller alive; the board keeps
    // showing its last known values and flags them as stale.
    console.error("[uk-atlas] observation poll failed:", error);
    return;
  }

  for (const observation of observations) {
    const print = fingerprint(observation);
    if (state.lastSeen.get(observation.regionSlug) === print) continue;
    state.lastSeen.set(observation.regionSlug, print);
    // Region slug as the partition key: all events for a region stay ordered.
    await bus.publish(WEATHER_TOPIC, observation.regionSlug, observation);
  }
}

/**
 * Idempotent. Called by the SSE route on first connection rather than at
 * module load, so a build or a static render never kicks off a network loop.
 */
export function ensurePoller(): Promise<void> {
  if (state.timer) return Promise.resolve();

  state.starting ??= tick().finally(() => {
    state.starting = null;
  });

  state.timer = setInterval(() => void tick(), POLL_MS);
  // Do not hold the Node event loop open on account of the poller.
  state.timer.unref?.();

  return state.starting;
}
