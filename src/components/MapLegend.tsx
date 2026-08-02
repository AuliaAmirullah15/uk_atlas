"use client";

/**
 * A legend key, as any real map sheet has.
 *
 * This is genuinely an accessibility feature, not just decoration: the map
 * uses a dashed grey line for internal borders and a dashed red one for
 * the UK border, and without a key that distinction is available only to
 * someone who already knows the conventions. Every entry pairs a swatch
 * with words.
 */

const ENTRIES: { swatch: React.ReactNode; label: string }[] = [
  {
    swatch: (
      <span className="h-2.5 w-2.5 rounded-full border-2 border-brass bg-accent-edge" />
    ),
    label: "Region: select for detail",
  },
  {
    // Matches the stamped pin on the plot: solid gold, one size larger.
    swatch: (
      <span className="h-3 w-3 rounded-full border-2 border-brass bg-brass" />
    ),
    label: "Visited (stamped in your passport)",
  },
  {
    swatch: (
      <span className="h-0 w-5 border-t-2 border-dashed border-ink-soft/70" />
    ),
    label: "Nation border, approximate",
  },
  {
    swatch: (
      <span className="h-0 w-5 border-t-2 border-dashed border-accent-edge" />
    ),
    label: "UK border with Ireland, approximate",
  },
  {
    swatch: <span className="h-0 w-5 border-t border-contour" />,
    label: "Relief shading: decorative, not surveyed",
  },
  {
    swatch: <span className="h-0 w-5 border-t border-grid" />,
    label: "Graticule, one line per degree",
  },
];

export function MapLegend() {
  return (
    <div className="rounded-md border border-rule bg-paper p-4">
      <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brass">
        Key
      </h3>
      <ul className="mt-3 grid list-none grid-cols-1 gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
        {ENTRIES.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex w-5 shrink-0 items-center justify-center"
            >
              {entry.swatch}
            </span>
            <span className="text-xs text-ink-soft">{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Coordinate readout that follows the pointer across the sheet.
 *
 * Deliberately latitude/longitude and *not* an OS National Grid reference
 * (the "TQ 3080 8040" format). A real grid reference needs an OSGB36 datum
 * shift and a Transverse Mercator projection, i.e. a genuine coordinate
 * transform, not a formatting trick. Printing a plausible-looking pair of
 * letters and digits would be inventing data on a page that is otherwise
 * careful about it, so this shows the coordinates we actually have.
 *
 * Hidden from assistive tech: it is a pointer-only affordance with no
 * keyboard equivalent, and each region page states its own coordinates as
 * real text anyway.
 */
export function CoordinateReadout({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const hasPosition = lat !== null && lon !== null;

  return (
    <p
      aria-hidden="true"
      className="pointer-events-none font-mono text-[0.6rem] uppercase tracking-wider text-ink-soft"
    >
      {hasPosition ? (
        <>
          {Math.abs(lat).toFixed(3)}°{lat >= 0 ? "N" : "S"}{" "}
          {Math.abs(lon).toFixed(3)}°{lon >= 0 ? "E" : "W"}
        </>
      ) : (
        <>Lat / long · move over the sheet</>
      )}
    </p>
  );
}