"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { REGIONS } from "@/lib/regions";
import { useWeatherStream, type ConnectionStatus } from "@/hooks/useWeatherStream";
import { SplitFlap } from "@/components/SplitFlap";
import type { Observation } from "@/lib/weather/observations";

/**
 * ============================================================
 * THE LIVE WEATHER DEPARTURE BOARD
 * ============================================================
 * Structure is a real <table>: twelve regions x the same columns is
 * tabular data, and a table gives screen-reader users row/column
 * navigation and header association for free. A grid of <div>s would
 * look identical and navigate far worse.
 *
 * Announcement strategy — one polite live region for the whole board,
 * not one per row. Twelve independent live regions firing on the same
 * poll would queue twelve interruptions. Instead each settled row is
 * folded into a single sentence and the region announces the batch.
 */

const STALE_AFTER_SECONDS = 20 * 60;

/* ------------------------------------------------------------------
   A coarse clock.

   Staleness depends on wall-clock time, which makes it impure render
   data — reading Date.now() during render is exactly the sort of thing
   that breaks under concurrent rendering. Reading it as an external
   store fixes that, and the value is quantised to whole minutes so
   getSnapshot stays referentially stable between ticks (returning a
   fresh number on every call would spin React forever).
   ------------------------------------------------------------------ */

function subscribeToMinuteTick(onChange: () => void): () => void {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

function getMinuteBucket(): number {
  return Math.floor(Date.now() / 60_000);
}

/**
 * Zero on the server. Staleness then reads as a hugely negative age, i.e.
 * "not stale", which is the right default for prerendered HTML that has no
 * observations in it yet.
 */
function getServerMinuteBucket(): number {
  return 0;
}

function useMinuteBucket(): number {
  return useSyncExternalStore(
    subscribeToMinuteTick,
    getMinuteBucket,
    getServerMinuteBucket,
  );
}

function StatusPill({
  status,
  offset,
}: {
  status: ConnectionStatus;
  offset: number | null;
}) {
  const copy: Record<ConnectionStatus, { label: string; dot: string }> = {
    connecting: { label: "Connecting", dot: "bg-amber" },
    live: { label: "Live", dot: "bg-woodland" },
    paused: { label: "Paused", dot: "bg-ink-soft" },
    error: { label: "Reconnecting", dot: "bg-postbox" },
  };
  const { label, dot } = copy[status];

  return (
    <p className="flex items-center gap-2 font-mono text-xs tracking-wide text-flap/80">
      {/* Colour is reinforced by the text label, never used alone (SC 1.4.1). */}
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
      {offset !== null && <span className="text-flap/50">· offset {offset}</span>}
    </p>
  );
}

function BoardRow({
  boardName,
  regionName,
  slug,
  observation,
  nowSeconds,
  onSettled,
}: {
  boardName: string;
  regionName: string;
  slug: string;
  observation: Observation | undefined;
  nowSeconds: number;
  onSettled: (slug: string, sentence: string) => void;
}) {
  const stale =
    observation !== undefined &&
    nowSeconds - observation.observedAtEpoch > STALE_AFTER_SECONDS;

  // Placeholder glyphs while the first poll lands — a real board's blanks.
  const temp = observation ? `${observation.tempC}°` : "--°";
  const wind = observation ? `${observation.windKph}` : "--";
  const condition = observation?.conditionLabel ?? "Awaiting data";
  const verdict = observation?.verdict ?? "";

  const handleSettled = () => {
    if (!observation) return;
    onSettled(
      slug,
      `${regionName}: ${observation.conditionLabel}, ${observation.tempC} degrees, wind ${observation.windKph} kilometres per hour.`,
    );
  };

  return (
    <tr className="border-b border-flap/10 last:border-0">
      <th scope="row" className="py-2 pr-3 text-left align-middle font-normal">
        <Link
          href={`/region/${slug}`}
          className="group inline-flex flex-col gap-1 rounded-sm"
        >
          <SplitFlap value={boardName} width={11} onSettled={handleSettled} />
          {/* The accessible name for the row and the link, in one place. */}
          <span className="font-sans text-xs text-flap/70 group-hover:text-flap group-hover:underline">
            {regionName}
          </span>
        </Link>
      </th>

      <td className="py-2 pr-3 align-middle">
        <SplitFlap value={temp} width={4} tone="amber" align="right" />
      </td>

      <td className="py-2 pr-3 align-middle">
        <SplitFlap value={wind} width={3} align="right" />
        <span className="ml-1 font-mono text-[0.65rem] text-flap/60">kph</span>
      </td>

      <td className="py-2 pr-3 align-middle">
        <SplitFlap value={condition} width={16} />
      </td>

      <td className="py-2 align-middle">
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-amber/90">
          {stale ? "Stale" : verdict}
        </span>
      </td>
    </tr>
  );
}

export function DepartureBoard() {
  const { observations, status, offset, lastUpdateAt, paused, togglePaused } =
    useWeatherStream();
  const [announcement, setAnnouncement] = useState("");
  const pending = useRef(new Map<string, string>());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nowSeconds = useMinuteBucket() * 60;

  /**
   * Collect settled rows, then announce them as one utterance. Without this
   * debounce a poll that changes eight regions produces eight interruptions.
   */
  const handleSettled = (slug: string, sentence: string) => {
    pending.current.set(slug, sentence);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      const sentences = [...pending.current.values()];
      pending.current.clear();
      if (sentences.length === 0) return;
      setAnnouncement(
        sentences.length > 4
          ? `Weather updated for ${sentences.length} regions.`
          : sentences.join(" "),
      );
    }, 400);
  };

  return (
    <section
      aria-labelledby="board-heading"
      className="rounded-lg bg-board p-4 shadow-lg sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="board-heading"
            className="font-mono text-lg font-semibold tracking-[0.2em] text-flap uppercase"
          >
            UK Weather Departures
          </h2>
          <p className="mt-1 max-w-prose text-xs text-flap/60">
            Live observations from Open-Meteo, streamed over Server-Sent
            Events. Upstream refreshes roughly every 15 minutes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <StatusPill status={status} offset={offset} />
          {/*
            SC 2.2.2 Pause, Stop, Hide. A real control that closes the
            stream, not a cosmetic one.
          */}
          <button
            type="button"
            onClick={togglePaused}
            aria-pressed={paused}
            className="rounded-sm border border-flap/30 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-flap transition-colors hover:bg-flap/10"
          >
            {paused ? "Resume updates" : "Pause updates"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Current weather for each UK region. Updates automatically; use the
            pause button to stop updates.
          </caption>
          <thead>
            <tr className="border-b border-flap/25">
              {["Region", "Temp", "Wind", "Conditions", "Verdict"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="pb-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-flap/60"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REGIONS.map((region) => (
              <BoardRow
                key={region.slug}
                slug={region.slug}
                boardName={region.boardName}
                regionName={region.name}
                observation={observations.get(region.slug)}
                nowSeconds={nowSeconds}
                onSettled={handleSettled}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-[0.65rem] text-flap/45">
        {lastUpdateAt
          ? `Last change received ${lastUpdateAt.toLocaleTimeString("en-GB")}`
          : "Awaiting first observation…"}
      </p>

      {/*
        The single announcement channel for the whole board. `polite` waits
        for a gap in speech; `assertive` here would talk over the user.
      */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
