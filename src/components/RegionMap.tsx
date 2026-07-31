import Link from "next/link";
import { REGIONS, type Region } from "@/lib/regions";
import {
  GB_PATH,
  IRELAND_PATH,
  NI_BORDER_PATH,
  SCOTLAND_BORDER_PATH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WALES_BORDER_PATH,
  graticule,
  project,
} from "@/lib/geo";

/**
 * ============================================================
 * STYLISED ORDNANCE SURVEY PLOT
 * ============================================================
 * The coastline and the pins are projected through the same function
 * from real latitude/longitude (see lib/geo.ts), so they cannot drift
 * out of agreement with each other.
 *
 * On interaction: the pins are real <Link>s inside a <ul>, laid over the
 * SVG rather than drawn inside it. That is deliberate —
 *
 *   - Tab order works with no roving-tabindex code.
 *   - Screen readers get "list, 12 items" and can jump between them.
 *   - Links behave like links: middle-click, open-in-new-tab, copy address.
 *
 * SVG <a> elements can be made to work, but focus rings and hit areas
 * inside a scaled viewBox are a fight not worth having.
 *
 * The contour and grid layers are pure texture behind aria-hidden nodes —
 * no information is encoded in them, which matters because the contour
 * brown fails text contrast by design (2.35:1).
 *
 * A stylised plot cannot convey precise geography, so the same regions
 * are also listed as ordinary text below the map.
 */

const { verticals, horizontals } = graticule();

/**
 * Decorative relief. Centres are the real coordinates of actual upland
 * areas, so the contour rings fall on the Highlands and Snowdonia rather
 * than at arbitrary points — the texture then reinforces the geography
 * instead of fighting it. Still decoration: no data is read from it.
 */
const UPLANDS = [
  { name: "Highlands", lat: 57.0, lon: -4.6, rx: 26, ry: 18, rings: 7, step: 13, rotate: -25 },
  { name: "Southern Uplands", lat: 55.3, lon: -3.7, rx: 16, ry: 10, rings: 4, step: 9, rotate: -12 },
  { name: "Lake District", lat: 54.45, lon: -3.1, rx: 10, ry: 8, rings: 3, step: 7, rotate: 0 },
  { name: "Pennines", lat: 54.3, lon: -2.2, rx: 8, ry: 22, rings: 4, step: 7, rotate: 8 },
  { name: "Peak District", lat: 53.35, lon: -1.8, rx: 9, ry: 8, rings: 3, step: 7, rotate: 0 },
  { name: "Snowdonia", lat: 52.95, lon: -3.85, rx: 12, ry: 9, rings: 4, step: 8, rotate: -18 },
  { name: "Brecon Beacons", lat: 51.88, lon: -3.44, rx: 12, ry: 7, rings: 3, step: 7, rotate: -8 },
  { name: "Dartmoor", lat: 50.58, lon: -3.92, rx: 9, ry: 8, rings: 3, step: 7, rotate: 0 },
  { name: "Mournes", lat: 54.18, lon: -6.02, rx: 8, ry: 6, rings: 3, step: 6, rotate: -20 },
].map((upland) => {
  const { x, y } = project(upland.lat, upland.lon);
  return { ...upland, cx: x, cy: y };
});

/** Where the label sits relative to its pin, to stop neighbours colliding. */
function labelClasses(side: Region["labelSide"]): string {
  switch (side) {
    case "right":
      return "left-full ml-1.5 -translate-y-1/2 top-1/2";
    case "left":
      return "right-full mr-1.5 -translate-y-1/2 top-1/2";
    case "above":
      return "bottom-full mb-1.5 left-1/2 -translate-x-1/2";
    case "below":
      return "top-full mt-1.5 left-1/2 -translate-x-1/2";
  }
}

export function RegionMap() {
  return (
    <section aria-labelledby="map-heading">
      <h2
        id="map-heading"
        className="font-mono text-sm uppercase tracking-[0.2em] text-ink-soft"
      >
        Sheet 1 — The United Kingdom
      </h2>
      <p className="mt-2 max-w-prose text-sm text-ink-soft">
        Twelve regions, each with its own food, festivals and weather. Pick one
        from the plot, or from the list beneath it.
      </p>

      <div className="mt-5 rounded-lg border-2 border-grid/50 bg-paper-alt p-3 sm:p-5">
        <div
          className="relative mx-auto"
          style={{
            width: "100%",
            maxWidth: 560,
            aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}`,
          }}
        >
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="absolute inset-0 h-full w-full"
            role="presentation"
          >
            <defs>
              {/* Contours are clipped to the land, as on a real sheet. */}
              <clipPath id="land-clip">
                <path d={GB_PATH} />
                <path d={IRELAND_PATH} />
              </clipPath>
            </defs>

            {/* Sea tint — pale OS blue, not the greenish cast a low-opacity
                water blue picks up over the cream paper. */}
            <rect
              width={VIEW_WIDTH}
              height={VIEW_HEIGHT}
              fill="var(--color-grid)"
              opacity="0.16"
            />

            {/* Graticule, one line per whole degree. */}
            <g stroke="var(--color-grid)" strokeWidth="0.6" opacity="0.32">
              {verticals.map((x) => (
                <line key={`v${x}`} x1={x} y1={0} x2={x} y2={VIEW_HEIGHT} />
              ))}
              {horizontals.map((y) => (
                <line key={`h${y}`} x1={0} y1={y} x2={VIEW_WIDTH} y2={y} />
              ))}
            </g>

            {/* Landmass. Ireland sits lighter: it is drawn for geographic
                honesty, but only Northern Ireland is covered here. */}
            <path
              d={IRELAND_PATH}
              fill="var(--color-moor)"
              opacity="0.5"
              stroke="var(--color-ink-soft)"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
            <path
              d={GB_PATH}
              fill="var(--color-moor)"
              stroke="var(--color-ink)"
              strokeWidth="1.6"
              strokeOpacity="0.55"
            />

            {/*
              Decorative contour rings, clipped to land and placed over the
              upland areas they gesture at — the Highlands, Snowdonia, the
              Pennines, Dartmoor. Kept faint and rotated so they read as
              relief shading rather than a set of bullseyes.
            */}
            <g
              clipPath="url(#land-clip)"
              stroke="var(--color-contour)"
              strokeWidth="0.7"
              fill="none"
              opacity="0.4"
            >
              {UPLANDS.map((upland, index) =>
                Array.from({ length: upland.rings }, (_, i) => (
                  <ellipse
                    key={`u${index}-${i}`}
                    cx={upland.cx}
                    cy={upland.cy}
                    rx={upland.rx + i * upland.step}
                    ry={upland.ry + i * upland.step * 0.72}
                    transform={`rotate(${upland.rotate} ${upland.cx} ${upland.cy})`}
                  />
                )),
              )}
            </g>

            {/* Internal nation borders, dashed to signal simplification. */}
            <g
              fill="none"
              stroke="var(--color-ink-soft)"
              strokeWidth="1.3"
              strokeDasharray="6 4"
              opacity="0.55"
            >
              <path d={SCOTLAND_BORDER_PATH} />
              <path d={WALES_BORDER_PATH} />
            </g>

            {/* Approximate NI border, in postbox red to mark it as a UK
                boundary rather than an internal one. */}
            <path
              d={NI_BORDER_PATH}
              fill="none"
              stroke="var(--color-postbox-deep)"
              strokeWidth="1.4"
              strokeDasharray="5 4"
              opacity="0.7"
            />
          </svg>

          {/* Interactive layer. */}
          <ul className="absolute inset-0 m-0 list-none p-0">
            {REGIONS.map((region) => {
              const { x, y } = project(region.lat, region.lon);
              return (
                <li
                  key={region.slug}
                  className="absolute"
                  style={{
                    left: `${(x / VIEW_WIDTH) * 100}%`,
                    top: `${(y / VIEW_HEIGHT) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Link
                    href={`/region/${region.slug}`}
                    className="group relative flex h-11 w-11 items-center justify-center"
                  >
                    {/* 44px hit area (SC 2.5.8 Target Size) with a small pin. */}
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full border-2 border-paper bg-postbox shadow-sm transition-transform group-hover:scale-150 group-focus-visible:scale-150"
                    />
                    <span
                      className={`pointer-events-none absolute whitespace-nowrap rounded-xs bg-paper/95 px-1 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-wider text-ink group-hover:bg-postbox group-hover:text-paper ${labelClasses(
                        region.labelSide,
                      )}`}
                    >
                      {region.boardName}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-wider text-ink-soft">
          Not to scale · Ireland shown for context · border approximate
        </p>
      </div>

      {/* The non-spatial equivalent. Not a fallback — a peer. */}
      <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        All regions
      </h3>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map((region) => (
          <li key={region.slug}>
            <Link
              href={`/region/${region.slug}`}
              className="flex items-baseline justify-between gap-2 rounded-md border border-grid/40 bg-paper px-3 py-2 transition-colors hover:border-postbox hover:bg-paper-alt"
            >
              <span className="font-semibold text-ink">{region.name}</span>
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-soft">
                {region.nation}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
