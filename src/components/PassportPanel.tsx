"use client";

import Link from "next/link";
import { useEffect } from "react";
import { REGIONS } from "@/lib/regions";
import { usePassport } from "@/hooks/usePassport";

/**
 * The passport panel — a rubber-stamp collection of the regions you have
 * looked at.
 *
 * Accessibility notes:
 *  - Progress is stated in text ("5 of 12 collected"), never conveyed by
 *    the stamps alone.
 *  - A stamped region is marked with a visually-hidden "visited" for
 *    screen readers, because the visual cue is a rotated stamp graphic
 *    and rotation is not information (SC 1.4.1).
 *  - Reset is a real button with a confirmation of what it will do; it is
 *    destructive and irreversible, so it should not be a bare icon.
 */

export function PassportPanel() {
  const { collected, total, has, reset, complete, passport } = usePassport();

  return (
    <section
      aria-labelledby="passport-heading"
      className="rounded-lg border-2 border-grid/50 bg-paper-alt p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="passport-heading"
          className="font-mono text-sm uppercase tracking-[0.2em] text-ink-soft"
        >
          Passport
        </h2>
        <p className="font-mono text-xs text-ink-soft">
          <span className="font-bold text-postbox-deep">{collected}</span> of{" "}
          {total} collected
        </p>
      </div>

      <p className="mt-2 text-sm text-ink-soft">
        {complete
          ? "All twelve. You have read the entire sheet — go outside."
          : "Open a region page to stamp it. Saved on this device only, no account involved."}
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {REGIONS.map((region) => {
          const stamped = has(region.slug);
          const at = passport[region.slug];
          return (
            <li key={region.slug}>
              <Link
                href={`/region/${region.slug}`}
                className={`relative flex h-full flex-col justify-between gap-1 overflow-hidden rounded-md border-2 px-3 py-2 transition-colors ${
                  stamped
                    ? "border-postbox/60 bg-paper"
                    : "border-dashed border-grid/50 bg-paper/50 hover:border-grid"
                }`}
              >
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-wider ${
                    stamped ? "text-ink" : "text-ink-soft"
                  }`}
                >
                  {region.boardName}
                </span>

                {stamped ? (
                  <>
                    {/* The stamp. Decorative; the text below carries it. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-1 -right-3 -rotate-12 rounded-sm border-2 border-postbox/70 px-2 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-widest text-postbox/70"
                    >
                      Visited
                    </span>
                    <span className="font-mono text-[0.55rem] text-ink-soft">
                      {at
                        ? new Date(at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                      <span className="sr-only"> — visited</span>
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-[0.55rem] text-ink-soft">
                    Not yet visited
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {collected > 0 && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md border border-grid/50 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink-soft transition-colors hover:border-postbox hover:text-postbox-deep"
        >
          Clear all {collected} stamps
        </button>
      )}
    </section>
  );
}

/**
 * Drop into a region page to record the visit. Renders nothing.
 *
 * Split out as its own component so the region page itself stays a server
 * component and continues to prerender — only this leaf needs to be
 * client-side.
 */
export function StampOnVisit({ slug }: { slug: string }) {
  const { stamp } = usePassport();

  // Writing to localStorage on mount is the textbook use of an effect:
  // synchronising an external system with what React just rendered.
  // `stamp` is idempotent (first visit wins), so a re-run is harmless.
  useEffect(() => {
    stamp(slug);
  }, [slug, stamp]);

  return null;
}