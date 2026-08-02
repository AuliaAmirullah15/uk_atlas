# The Contour Atlas

A field guide to the twelve regions of the United Kingdom. Food, festivals,
landmarks and live weather, drawn like an Ordnance Survey sheet that has been
reprinted for the evening: midnight teal, brass hairlines, Hogwarts claret.

The centrepiece is a station style **split-flap departure board** wired to a
live weather stream.

Next.js 16, React 19, Tailwind 4. No API keys, no accounts, no database.

```bash
npm install
npm run dev
```

***

## How "live" is it, really

I want to be straight about this, because animation makes it very easy to imply
more than is actually happening.

Open-Meteo has no push API. It is plain REST, and the `current` block it returns
carries `interval: 900`, so the upstream data only changes about every fifteen
minutes. There is no firehose to plug into. What there is:

* A poller on the server that asks for all twelve regions in a single HTTP call
  every 60 seconds. Open-Meteo accepts comma joined coordinates and returns an
  array in input order, so twelve regions cost one request.
* A change filter. Only readings where the temperature, wind, condition code or
  observation time actually moved get published, so the flaps never flip just to
  tell you the same thing twice.

That is roughly 1,440 requests a day for the whole board, which sits well inside
the free tier.

Claiming per second weather would be a lie told with animation, so I didn't.

## How it fits together

```
        Open-Meteo (REST, polled every 60s)
                      │
                      ▼
              producer  (observations.ts)
                      │
                      ▼
                  EventBus            ← the seam
                      │
                      ▼
        SSE route  /api/weather/stream
                      │
                      ▼
        useWeatherStream (EventSource)
                      │
                      ▼
            DepartureBoard → SplitFlap
```

Where things live:

* [`lib/streaming/bus.ts`](src/lib/streaming/bus.ts) is the `EventBus`
  interface plus the in process implementation. This is the Kafka seam.
* [`lib/weather/observations.ts`](src/lib/weather/observations.ts) is the
  Open-Meteo client and the polling producer.
* [`app/api/weather/stream/route.ts`](src/app/api/weather/stream/route.ts) is
  the SSE endpoint.
* [`hooks/useWeatherStream.ts`](src/hooks/useWeatherStream.ts) handles the
  client subscription and the pause control.
* [`components/SplitFlap.tsx`](src/components/SplitFlap.tsx) is the flap
  animation and all of its accessibility handling.
* [`lib/geo.ts`](src/lib/geo.ts) holds the map projection, coastline and
  borders.

### Why SSE rather than WebSocket

The data only travels one way, server to board. A WebSocket's upstream channel
would sit there unused, and it is a second protocol to run and operate.

SSE also works inside a Next.js route handler over ordinary HTTP. A WebSocket
needs an HTTP upgrade, which App Router route handlers don't perform, so I would
have had to run a separate `ws` process next to Next.

And SSE reconnects by itself. Its `Last-Event-ID` header maps exactly onto a
Kafka consumer offset, which is the bit I actually cared about.

### The offset trick

Every SSE frame carries `id: <offset>`. When the browser reconnects it sends
that back as `Last-Event-ID`, and the server replays only the records *after*
that offset from a bounded retention log.

That is consumer offset semantics over plain HTTP, and it is the reason the
Kafka swap further down is a swap rather than a rewrite.

Behaviour I verified:

```
$ # fresh connect
+3ms  id=0  key=scotland      → 15°C 8kph "Overcast" (Classic)
...
+4ms  id=11 key=wales         → 20°C 17kph "Clear sky" (Glorious)

$ # reconnect claiming Last-Event-ID: 8
ids received: [9, 10, 11]      # 0 through 8 are not replayed
```

***

## Accessibility

This was the starting point, not a pass at the end.

### The split-flap problem

A split-flap board reaches its target by cycling every character through a drum.
Rendered naively, a screen reader announces every intermediate frame, and
"Leeds" arrives as several hundred utterances of alphabet soup. So:

* The flipping glyphs sit inside `aria-hidden`. Assistive tech never sees a
  single intermediate frame.
* The real values are announced from one polite live region for the whole board,
  once the rows have settled. One region, not twelve. Twelve live regions firing
  on the same poll would queue twelve interruptions. Updates are debounced and
  batched into a single sentence, collapsing to "Weather updated for 8 regions"
  past a threshold.
* `prefers-reduced-motion` is honoured in JS, not only in CSS. Killing the CSS
  animation on its own would still leave the glyph *sequence* running, which is
  the part that actually causes the trouble. Under reduced motion the target
  value renders straight away.
* There is a real pause control (WCAG 2.1 SC 2.2.2, Pause Stop Hide) and it
  closes the stream rather than hiding the updates, so a paused board is
  genuinely a quiet one.

### Structure

* The board is a real `<table>`. Twelve regions × fixed columns is tabular data,
  and a table gives row and column navigation plus header association for free.
* Map pins are real `<Link>`s in a `<ul>`, laid over the SVG rather than drawn
  inside it. Tab order then works with no roving tabindex code, and links behave
  like links: middle click, open in a new tab, copy address.
* A stylised plot can't convey precise geography, so every region is also listed
  as plain text below the map. A peer, not a fallback.
* Pins have 44px minimum hit areas (SC 2.5.8), done with padding so the visible
  pin stays small.
* Skip link, one `<h1>` per page, `lang="en-GB"`, and `forced-colors` support.

### Colour

The palette is brass and claret on midnight teal. Every colour that carries text
was measured against both page surfaces before it went in, and the numbers below
are ratios against `paper` and `paper-alt`:

* **ink** 14.28 and 11.91. AAA. Body copy.
* **ink-soft** 8.82 and 7.36. AAA. Secondary copy.
* **brass** 8.37 and 6.98. AAA. Section labels, links, stamps.
* **accent-edge** 3.75 and 3.13. Non-text only: borders, pins, dots.
* **accent** 2.00 and 1.67. Fill only, and never on its own.
* **rule** 3.68 and 3.07. Non-text only: hairlines and dividers.
* **contour** 5.44. Decorative texture only.

The most interesting thing I hit here: **red cannot carry small text on a dark
ground.** Red contributes only 21% of perceived luminance, so against this
background even pure `#FF0000` reaches 4.28:1, which is under the 4.5:1 floor.
The only way to push a red past it is to add green and blue, and that is exactly
what turns it pink. So the red does no lettering at all. Every place that wanted
red text uses brass instead, and the red is kept for fills and borders, where
the bar is 3:1 and a genuine cardinal red clears it.

Two other decisions worth naming. A border written as 40% of a pale colour
composites down to roughly 2:1 and quietly fails the 3:1 that non-text contrast
needs, so every rule here is a solid token at full opacity. And on the map, a
red pin against the teal land is only 1.9:1, so each pin is ringed in brass at
4.64:1, and the ring is what makes the pin visible rather than the fill.

None of this is claimed on trust:

```bash
npm run check:contrast
```

That script reads the tokens out of `globals.css` itself rather than a copy of
them, composites every alpha modifier against the backdrop it actually sits on,
and checks 41 pairings. It exits non-zero on any failure, so it can gate CI, and
it fails outright if a red token is ever used in a text role. It isn't wired
into `npm run build` yet, so for now it is a command you have to remember to
run.

Status is never carried by colour alone. The connection dot always has a text
label beside it (SC 1.4.1), and a visited pin differs by hue *and* by size *and*
by a visually hidden "visited".

***

## Data and geography

* The twelve regions are the ONS ITL 1 statistical regions, so the division is
  defensible rather than something I invented.
* The coastline, the nation borders and the region pins are all projected
  through the same function from real latitude and longitude
  ([`lib/geo.ts`](src/lib/geo.ts)). Percentage positions tuned by hand drift out
  of agreement with the outline the moment either one is touched. A shared
  projection can't disagree with itself.
* The projection is equirectangular with a cosine correction on longitude.
  Without it Britain comes out about 70% too wide at 54°N.
* Ireland is drawn in full and runs off the western edge of the sheet, the way a
  real OS sheet ends mid landmass. Only Northern Ireland is covered by the atlas.
  Its border is dashed and labelled approximate, because the real line is
  famously convoluted and a smooth curve of six points shouldn't pretend
  otherwise.
* Observation times are requested as `timeformat=unixtime`. Open-Meteo's default
  (`2026-07-29T20:30`) carries no UTC offset, so `new Date(...)` would read it in
  the *viewer's* timezone and compute staleness wrongly for anyone outside the
  UK.

There is a running rule here: don't invent data that looks real. The coordinate
readout shows latitude and longitude rather than a plausible looking OS grid
reference, because a real grid reference needs an OSGB36 datum shift and a
Transverse Mercator projection, not a formatting trick. The scone question
records what you picked and says so, rather than showing a national percentage I
would have had to make up.

## Deploying it

Streaming needs a Node server. A static export can't hold an SSE connection
open, so `output: "export"` is not an option. Behind nginx the route already
sets `X-Accel-Buffering: no`, which stops the proxy buffering the stream into
uselessness.

***

## Next things to do

### Step 1. Check it on a phone

Everything so far has been verified at desktop width. The departure board is a
five column table and the hero is tuned for a wide card, so narrow screens are
the most likely place something is genuinely broken. This one is first for a
reason.

### Step 2. Tidy the loose ends

Small and quick:

* Two dead CSS classes, `.deco-flourish` and `.os-grid`, are defined but no
  longer used anywhere.
* `mask-composite` on the hero weave has no fallback. Where it isn't supported
  the two mask layers default to *add* instead of *intersect*, which would put
  the texture at full strength behind the headline. Needs a look in Safari.
* The focus ring has been verified by measurement (8.37:1 on the page, 9.01:1 on
  the board) but not yet by eye, because headless Chrome won't hold
  `:focus-visible` for a screenshot.

### Step 3. Swap the in process bus for Kafka

This is the interesting one, and the whole app was built so it stays a swap.
The browser facing half talks to `EventBus` and never to a transport, so moving
to Kafka changes one file plus one line in `bus.ts`.

```bash
docker compose -f docker-compose.kafka.yml up -d
docker exec uk-atlas-redpanda rpk topic create \
  uk.weather.observations --partitions 12 --replicas 1

npm install kafkajs
mv src/lib/streaming/kafka-bus.ts.example src/lib/streaming/kafka-bus.ts
# then edit the `bus` export in src/lib/streaming/bus.ts, shown below

STREAM_BACKEND=kafka npm run dev
```

The one line in [`bus.ts`](src/lib/streaming/bus.ts):

```ts
export const bus: EventBus =
  process.env.STREAM_BACKEND === "kafka"
    ? (globalForBus.__ukAtlasBus ??= new KafkaEventBus(WEATHER_TOPIC))
    : (globalForBus.__ukAtlasBus ??= new LocalEventBus());
```

Nothing else moves. Not the SSE route, not the hook, not the board. Redpanda
console is at <http://localhost:8080> if you want to watch records land.

The envelope was shaped like a Kafka record from the start, which is what makes
this cheap. `topic` is the topic, `key` is the partition key (the region slug,
which keeps each region's events ordered), `offset` is the offset and also the
SSE `id:` field, `timestamp` is the record timestamp, and `value` is the value.

**Two things people get wrong about Kafka in a browser**, both of which this
setup has to handle:

The browser can't speak Kafka at all. The protocol runs over raw TCP and a
browser cannot open a raw TCP socket. There is always a server bridge, and the
`KafkaEventBus` consumer *is* that bridge. Anything advertising "Kafka in the
browser" is describing a proxy.

Consumer groups will silently break the fan out. A consumer group distributes
partitions *between* its members, so if every Next.js instance joined the same
group, each browser would only see the regions whose partitions its instance
happened to own. That is the opposite of a broadcast. The fix is a unique group
id per process, which makes every instance a full independent reader. The honest
cost is that group metadata then accumulates per process, so set a short
`offsetRetention` or reap idle groups if this ever runs longer than a demo.

***

## Attribution

Weather from [Open-Meteo](https://open-meteo.com/), CC BY 4.0.

An affectionate homage to Ordnance Survey cartography. Not affiliated with, or
endorsed by, Ordnance Survey.
