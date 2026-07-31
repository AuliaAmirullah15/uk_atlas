/**
 * ============================================================
 * THE KAFKA SEAM
 * ============================================================
 * This is the whole point of the streaming design: the browser-facing
 * half of the app talks to `EventBus`, never to a concrete transport.
 * Phase 1 ships `LocalEventBus` (in-process). Phase 2 drops in a Kafka
 * implementation of this same interface and nothing above it changes —
 * not the SSE route, not the React hook, not the board.
 *
 * The envelope deliberately mirrors a Kafka record so the migration is
 * a swap rather than a reshape:
 *
 *   topic      -> Kafka topic            ("uk.weather.observations")
 *   key        -> Kafka partition key    (region slug; keeps a region's
 *                                         events ordered on one partition)
 *   offset     -> Kafka offset           (also the SSE `id:` field, which
 *                                         is how Last-Event-ID resume maps
 *                                         onto consumer offset semantics)
 *   timestamp  -> Kafka record timestamp
 *   value      -> Kafka record value
 */

export type StreamEnvelope<T> = {
  topic: string;
  key: string;
  offset: number;
  timestamp: string;
  value: T;
};

export type Handler<T> = (envelope: StreamEnvelope<T>) => void;
export type Unsubscribe = () => void;

export interface EventBus {
  publish<T>(topic: string, key: string, value: T): Promise<StreamEnvelope<T>>;
  /**
   * Subscribe to a topic. If `fromOffset` is given, any retained records
   * after that offset are replayed to the handler before live delivery
   * begins — the SSE reconnect story.
   */
  subscribe<T>(
    topic: string,
    handler: Handler<T>,
    fromOffset?: number,
  ): Unsubscribe;
  /** Latest retained record per key — lets a new client paint immediately. */
  snapshot<T>(topic: string): StreamEnvelope<T>[];
}

/**
 * In-process bus with a bounded per-topic log.
 *
 * The retention buffer is what makes Last-Event-ID resume work, and it is
 * the same reason Kafka keeps a log rather than a queue. It is capped so a
 * long-running dev server cannot grow without limit.
 */
const RETENTION = 500;

export class LocalEventBus implements EventBus {
  private log = new Map<string, StreamEnvelope<unknown>[]>();
  private subscribers = new Map<string, Set<Handler<never>>>();
  private nextOffset = new Map<string, number>();

  async publish<T>(
    topic: string,
    key: string,
    value: T,
  ): Promise<StreamEnvelope<T>> {
    const offset = this.nextOffset.get(topic) ?? 0;
    this.nextOffset.set(topic, offset + 1);

    const envelope: StreamEnvelope<T> = {
      topic,
      key,
      offset,
      timestamp: new Date().toISOString(),
      value,
    };

    const entries = this.log.get(topic) ?? [];
    entries.push(envelope as StreamEnvelope<unknown>);
    // Trim from the front once past retention.
    if (entries.length > RETENTION) entries.splice(0, entries.length - RETENTION);
    this.log.set(topic, entries);

    for (const handler of this.subscribers.get(topic) ?? []) {
      try {
        (handler as Handler<T>)(envelope);
      } catch {
        // A broken subscriber must not take down the publisher or its peers.
      }
    }

    return envelope;
  }

  subscribe<T>(
    topic: string,
    handler: Handler<T>,
    fromOffset?: number,
  ): Unsubscribe {
    if (fromOffset !== undefined) {
      for (const envelope of this.log.get(topic) ?? []) {
        if (envelope.offset > fromOffset) handler(envelope as StreamEnvelope<T>);
      }
    }

    const set = this.subscribers.get(topic) ?? new Set();
    set.add(handler as Handler<never>);
    this.subscribers.set(topic, set);

    return () => {
      this.subscribers.get(topic)?.delete(handler as Handler<never>);
    };
  }

  snapshot<T>(topic: string): StreamEnvelope<T>[] {
    const latestByKey = new Map<string, StreamEnvelope<unknown>>();
    for (const envelope of this.log.get(topic) ?? []) {
      latestByKey.set(envelope.key, envelope);
    }
    return [...latestByKey.values()] as StreamEnvelope<T>[];
  }

  subscriberCount(topic: string): number {
    return this.subscribers.get(topic)?.size ?? 0;
  }
}

/*
  Next.js dev hot-reloads modules, which would otherwise mint a fresh bus
  (and a fresh poller) on every edit and leak the old ones. Pinning to
  globalThis keeps exactly one bus per process.
*/
const globalForBus = globalThis as unknown as { __ukAtlasBus?: LocalEventBus };

export const bus: LocalEventBus = (globalForBus.__ukAtlasBus ??= new LocalEventBus());

export const WEATHER_TOPIC = "uk.weather.observations";
