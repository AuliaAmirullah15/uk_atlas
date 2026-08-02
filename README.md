# The Contour Atlas

A field guide to the twelve regions of the United Kingdom: food, festivals,
landmarks and live weather, drawn in the style of an Ordnance Survey sheet.
The signature element is a station-style **split-flap departure board** fed by
a live weather stream.

Built with Next.js 16, React 19, Tailwind 4, and no API keys.

```bash
npm install
npm run dev
```

---

## What is actually "live" here

Worth being straight about this, because animation makes it easy to imply more
than is true.

**Open-Meteo has no push API.** It is plain REST, and the `current` block it
returns carries `interval: 900`, so upstream data changes about every 15 minutes.
So there is no firehose to connect to. What exists is:

- a server-side poller that requests **all twelve regions in one HTTP call**
  every 60 seconds (Open-Meteo accepts comma-joined coordinates and returns an
  array in input order), and
- a **change filter**: only readings whose temperature, wind, condition code
  or observation time actually moved get published, so the flaps do not flip to
  announce identical data.

At ~1,440 requests/day for the whole board, this sits comfortably inside the
free tier.

## Architecture

```
Open-Meteo (REST, polled 60s)
        │
        ▼
   producer  ──────────►  EventBus  ──────────►  SSE Route Handler
 (observations.ts)      (the seam)              /api/weather/stream
                                                        │
                                                        ▼
                                              useWeatherStream (EventSource)
                                                        │
                                                        ▼
                                              DepartureBoard → SplitFlap
```

| File | Role |
| --- | --- |
| [`lib/streaming/bus.ts`](src/lib/streaming/bus.ts) | `EventBus` interface + in-process implementation. **The Kafka seam.** |
| [`lib/weather/observations.ts`](src/lib/weather/observations.ts) | Open-Meteo client + polling producer |
| [`app/api/weather/stream/route.ts`](src/app/api/weather/stream/route.ts) | SSE endpoint |
| [`hooks/useWeatherStream.ts`](src/hooks/useWeatherStream.ts) | Client subscription, pause control |
| [`components/SplitFlap.tsx`](src/components/SplitFlap.tsx) | The flap animation, and its accessibility handling |
| [`lib/geo.ts`](src/lib/geo.ts) | Map projection, coastline, borders |

### Why SSE and not WebSocket

- The data is **one-directional** (server → board). A WebSocket's upstream
  channel would sit unused, and it is a second protocol to operate.
- SSE runs inside a Next.js Route Handler over plain HTTP. A WebSocket needs an
  HTTP upgrade, which App Router route handlers do not perform. It means
  running a separate `ws` server process alongside Next.
- SSE **reconnects on its own**, and its `Last-Event-ID` header maps exactly
  onto a Kafka consumer offset. Which brings us to:

### The offset trick

Every SSE frame carries `id: <offset>`. On reconnect the browser sends back
`Last-Event-ID`, and the server replays only records *after* that offset from a
bounded retention log. That is consumer-offset semantics over plain HTTP, and
it is why the Kafka migration below is a swap rather than a redesign.

Verified behaviour:

```
$ # fresh connect
+3ms  id=0  key=scotland      → 15°C 8kph "Overcast" (Classic)
...
+4ms  id=11 key=wales         → 20°C 17kph "Clear sky" (Glorious)

$ # reconnect claiming Last-Event-ID: 8
ids received: [9, 10, 11]      # no replay of 0..8
```

---

## Phase 2: Kafka

The browser-facing half of the app talks to `EventBus`, never to a transport.
Swapping in Kafka changes **one file**, plus one line in `bus.ts`.

```bash
docker compose -f docker-compose.kafka.yml up -d
docker exec uk-atlas-redpanda rpk topic create \
  uk.weather.observations --partitions 12 --replicas 1

npm install kafkajs
mv src/lib/streaming/kafka-bus.ts.example src/lib/streaming/kafka-bus.ts
# then edit the `bus` export in src/lib/streaming/bus.ts (see below)

STREAM_BACKEND=kafka npm run dev
```

The swap in [`bus.ts`](src/lib/streaming/bus.ts):

```ts
export const bus: EventBus =
  process.env.STREAM_BACKEND === "kafka"
    ? (globalForBus.__ukAtlasBus ??= new KafkaEventBus(WEATHER_TOPIC))
    : (globalForBus.__ukAtlasBus ??= new LocalEventBus());
```

Nothing else changes: not the SSE route, not the hook, not the board.
Redpanda console at <http://localhost:8080> to watch records land.

### Two things people get wrong about Kafka in the browser

**1. The browser cannot speak Kafka.** Kafka's protocol runs over raw TCP, and
a browser cannot open a raw TCP socket. There is always a server bridge; the
`KafkaEventBus` consumer *is* that bridge. Anything claiming "Kafka in the
browser" is describing a proxy.

**2. Consumer groups will silently break your fan-out.** A consumer group
distributes partitions *between* members. If every Next.js instance joined the
same group, each browser would see only the regions whose partitions its
instance happened to own, which is the opposite of a broadcast. The fix is a **unique
group id per process**, which makes each instance a full independent reader.
Its honest cost: group metadata accumulates per process, so set a short
`offsetRetention` or reap idle groups if this runs beyond a demo.

The envelope was designed to mirror a Kafka record from the start:

| Envelope | Kafka |
| --- | --- |
| `topic` | topic |
| `key` | partition key (region slug, which keeps a region's events ordered) |
| `offset` | offset (and the SSE `id:` field) |
| `timestamp` | record timestamp |
| `value` | record value |

---

## Accessibility

This was the priority, not a pass at the end.

### The split-flap problem

A split-flap board reaches its target by cycling every character through a
drum. Rendered naively, a screen reader announces **every intermediate frame**.
"Leeds" becomes several hundred utterances of alphabet soup. So:

- The flipping glyphs are inside `aria-hidden`. Assistive tech never sees a
  single intermediate frame.
- The real values are announced from **one** polite live region for the whole
  board, once rows have **settled**. One region, not twelve. Twelve live
  regions firing on the same poll would queue twelve interruptions. Updates are
  debounced and batched into a single sentence, collapsing to
  "Weather updated for 8 regions" past a threshold.
- `prefers-reduced-motion` is honoured **in JS, not just CSS**. Killing the CSS
  animation alone would still leave the glyph *sequence* running, which is the
  part that causes trouble. Under reduced motion the target renders directly.
- There is a **real pause control** (WCAG 2.1 SC 2.2.2, Pause Stop Hide) and it
  closes the stream rather than hiding updates, so a paused board is a quiet
  one.

### Structure

- The board is a real `<table>`: twelve regions × fixed columns is tabular
  data, and a table gives row/column navigation and header association for
  free.
- Map pins are real `<Link>`s in a `<ul>`, laid *over* the SVG rather than
  drawn inside it, so tab order works with no roving-tabindex code, and links
  behave like links (middle-click, open-in-new-tab, copy address).
- Because a stylised plot cannot convey precise geography, every region is
  **also** listed as plain text below the map. A peer, not a fallback.
- 44px minimum hit areas on pins (SC 2.5.8), achieved with padding so the
  visual pin stays small.
- Skip link, one `<h1>` per page, `lang="en-GB"`, `forced-colors` support.

### Colour

Every colour carrying text was checked against the paper background *before*
it went in. See the table at the top of
[`globals.css`](src/app/globals.css):

| Pair | Ratio | |
| --- | --- | --- |
| ink on paper | 16.81:1 | AAA |
| ink-soft on paper | 8.96:1 | AAA |
| postbox-deep on paper | 8.01:1 | AAA |
| postbox on paper | 5.68:1 | AA |
| water on paper | 6.99:1 | AA |
| grid on paper | 3.26:1 | non-text only (SC 1.4.11) |
| contour on paper | 2.35:1 | **decorative only** |

The contour brown *fails* text contrast, deliberately. It is only ever
texture: no information is encoded in the contour lines or grid squares alone,
and they live behind `aria-hidden` nodes. Status is never carried by colour
alone: the connection dot always has a text label beside it (SC 1.4.1).

---

## Data and geography

- The twelve regions are the ONS **ITL 1** statistical regions, so the carve-up
  is defensible rather than improvised.
- The coastline, the nation borders and the region pins are **all projected
  through the same function** from real latitude/longitude
  ([`lib/geo.ts`](src/lib/geo.ts)). Hand-tuned percentage positions drift out
  of agreement with the outline the moment either is touched; a shared
  projection cannot disagree with itself.
- Projection is equirectangular with a cosine correction on longitude. Without
  it, Britain comes out about 70% too wide at 54°N.
- Ireland is drawn in full and runs off the western edge of the sheet, the way
  a real OS sheet ends mid-landmass. Only Northern Ireland is covered by the
  atlas; the border is drawn dashed and labelled approximate, because the real
  line is famously convoluted and a smooth six-point curve should not pretend
  otherwise.
- Observation times are requested as `timeformat=unixtime`. Open-Meteo's
  default (`2026-07-29T20:30`) carries **no UTC offset**, so `new Date(...)`
  would read it in the *viewer's* zone and compute staleness wrongly for anyone
  outside the UK.

## Deployment note

Streaming needs a Node server. A static export cannot hold an SSE connection
open, so `output: "export"` is not an option here. Behind nginx, the route
already sets `X-Accel-Buffering: no` to stop the proxy buffering the stream
into uselessness.

## Attribution

Weather from [Open-Meteo](https://open-meteo.com/) (CC BY 4.0). An affectionate
homage to Ordnance Survey cartography, not affiliated with or endorsed by
Ordnance Survey.# uk_atlas
