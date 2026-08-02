"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Observation } from "@/lib/weather/observations";
import type { StreamEnvelope } from "@/lib/streaming/bus";

export type ConnectionStatus = "connecting" | "live" | "paused" | "error";

/** What the transport itself reports, independent of the pause control. */
type TransportStatus = "connecting" | "live" | "error";

export type WeatherStream = {
  observations: Map<string, Observation>;
  status: ConnectionStatus;
  /** Offset of the newest record applied, i.e. the consumer position. */
  offset: number | null;
  lastUpdateAt: Date | null;
  paused: boolean;
  togglePaused: () => void;
};

/**
 * Subscribes to the observation stream over SSE.
 *
 * The `paused` control is not a nicety. WCAG 2.1 SC 2.2.2 (Pause, Stop,
 * Hide) requires a mechanism to pause automatically updating information.
 * Pausing genuinely closes the connection rather than merely hiding
 * updates, so a paused board is also a quiet one for screen readers.
 *
 * Reconnection is left to EventSource, which respects our `retry:` interval
 * and sends `Last-Event-ID` automatically. The server turns that header
 * into a resume offset, so no observation is silently dropped.
 *
 * Note on state: `status` is *derived* rather than assigned inside the
 * effect. Setting state synchronously in an effect body triggers a second
 * render pass before paint; every setState below happens in a transport
 * callback or a user event handler, which is where it belongs.
 */
export function useWeatherStream(): WeatherStream {
  const [observations, setObservations] = useState<Map<string, Observation>>(
    () => new Map(),
  );
  const [transport, setTransport] = useState<TransportStatus>("connecting");
  const [offset, setOffset] = useState<number | null>(null);
  const [lastUpdateAt, setLastUpdateAt] = useState<Date | null>(null);
  const [paused, setPaused] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (paused) {
      // The cleanup from the previous run already closed the stream; there
      // is simply nothing to open while paused.
      return;
    }

    const source = new EventSource("/api/weather/stream");
    sourceRef.current = source;

    source.addEventListener("observation", (event) => {
      const messageEvent = event as MessageEvent<string>;
      let envelope: StreamEnvelope<Observation>;
      try {
        envelope = JSON.parse(messageEvent.data);
      } catch {
        return; // Malformed frame: ignore rather than crash the board.
      }

      setObservations((previous) => {
        const next = new Map(previous);
        next.set(envelope.value.regionSlug, envelope.value);
        return next;
      });
      setOffset(envelope.offset);
      setLastUpdateAt(new Date());
      setTransport("live");
    });

    source.addEventListener("open", () => setTransport("live"));

    source.addEventListener("error", () => {
      // EventSource retries on its own; surface the blip without wiping the
      // board, so the last known readings stay visible.
      setTransport(
        source.readyState === EventSource.CLOSED ? "error" : "connecting",
      );
    });

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [paused]);

  const togglePaused = useCallback(() => {
    setPaused((previous) => !previous);
    // Resuming means a fresh connection, so reset the transport view here
    // in the event handler rather than inside the effect.
    setTransport("connecting");
  }, []);

  const status: ConnectionStatus = paused ? "paused" : transport;

  return {
    observations,
    status,
    offset,
    lastUpdateAt,
    paused,
    togglePaused,
  };
}
