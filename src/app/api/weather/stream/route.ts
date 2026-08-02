/**
 * Server-Sent Events endpoint for the departure board.
 *
 * Why SSE rather than WebSocket, given the brief mentioned both:
 *
 *  - The data is one-directional (server -> board). A WebSocket's upstream
 *    channel would sit unused, and it buys a second protocol to operate.
 *  - SSE runs inside a Next.js Route Handler over plain HTTP. A WebSocket
 *    needs an HTTP upgrade, which App Router route handlers do not perform;
 *    it means a separate `ws` server process alongside Next.
 *  - SSE reconnects on its own, and its `Last-Event-ID` header maps exactly
 *    onto a Kafka consumer offset, which is what we want for phase 2.
 *
 * If bidirectional traffic ever lands (a user pinning regions server-side,
 * say), swapping to WebSocket means changing this file and the hook's
 * transport. The `EventBus` contract underneath is untouched.
 *
 * `force-dynamic` is required: a streaming response must never be
 * prerendered or cached.
 */

import { ensurePoller, type Observation } from "@/lib/weather/observations";
import { bus, WEATHER_TOPIC, type StreamEnvelope } from "@/lib/streaming/bus";

export const dynamic = "force-dynamic";

/** Comfortably inside typical 60s idle-proxy timeouts. */
const HEARTBEAT_MS = 25_000;

export async function GET(request: Request) {
  // Start the producer on first interest, not at module load.
  await ensurePoller();

  const lastEventId = request.headers.get("last-event-id");
  const resumeFrom = lastEventId ? Number(lastEventId) : undefined;
  const validResume =
    resumeFrom !== undefined && Number.isFinite(resumeFrom) ? resumeFrom : undefined;

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Client vanished between the abort signal and this write.
          closed = true;
        }
      };

      const sendEvent = (envelope: StreamEnvelope<Observation>) => {
        send(
          `event: observation\nid: ${envelope.offset}\ndata: ${JSON.stringify(
            envelope,
          )}\n\n`,
        );
      };

      // Tell the client how long to wait before retrying a dropped stream.
      send("retry: 3000\n\n");

      if (validResume === undefined) {
        // Fresh client: paint the whole board immediately from the retained
        // log instead of leaving twelve rows blank until the next poll.
        for (const envelope of bus.snapshot<Observation>(WEATHER_TOPIC)) {
          sendEvent(envelope);
        }
      }

      unsubscribe = bus.subscribe<Observation>(
        WEATHER_TOPIC,
        sendEvent,
        validResume,
      );

      // Comment frames keep intermediaries from reaping an idle connection.
      heartbeat = setInterval(() => send(`: keep-alive\n\n`), HEARTBEAT_MS);
      heartbeat.unref?.();

      const cleanup = () => {
        if (closed) return;
        closed = true;
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // Already closed by the runtime.
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Stops nginx buffering the stream into uselessness.
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
