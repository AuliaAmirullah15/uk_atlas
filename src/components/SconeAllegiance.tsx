"use client";

import { createLocalStore, useLocalStore } from "@/lib/store";

/**
 * The scone question.
 *
 * Note what this deliberately is *not*: a poll with a national tally.
 * There is no backend, so any "68% of Britain says jam first" figure would
 * be a number I made up and dressed as data, on a site that is otherwise
 * careful to say where its facts come from. So it records your allegiance,
 * tells you which county you have sided with, and says plainly that it is
 * stored on your device.
 *
 * Both orders are correct in their own county. That is the joke, and it is
 * also true.
 */

type Allegiance = "jam" | "cream" | null;

const store = createLocalStore<Allegiance>(
  "uk-atlas-scone",
  null,
  (raw) => (raw === "jam" || raw === "cream" ? raw : null),
);

const COPY: Record<"jam" | "cream", { county: string; note: string }> = {
  jam: {
    county: "Cornwall",
    note: "Jam on the scone, clotted cream on top. The Cornish method, and the one the county will defend at length.",
  },
  cream: {
    county: "Devon",
    note: "Clotted cream first, jam on top. The Devon method, and structurally the harder of the two to get right.",
  },
};

export function SconeAllegiance() {
  const [choice, setChoice] = useLocalStore(store);

  return (
    <section
      aria-labelledby="scone-heading"
      className="rounded-lg border border-brass-dim bg-paper-alt p-5"
    >
      <h2
        id="scone-heading"
        className="font-mono text-sm uppercase tracking-[0.2em] text-brass"
      >
        Declare yourself
      </h2>
      <p className="mt-2 max-w-prose text-ink">
        A cream tea. Which goes on first?
      </p>

      {/*
        A radiogroup rather than two independent buttons: these are mutually
        exclusive options with a current value, which is exactly what radio
        semantics describe. aria-checked carries the state, so it is never
        conveyed by the burgundy fill alone.
      */}
      <div
        role="radiogroup"
        aria-labelledby="scone-heading"
        className="mt-4 flex flex-wrap gap-3"
      >
        {(["jam", "cream"] as const).map((option) => {
          const selected = choice === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setChoice(selected ? null : option)}
              className={`rounded-md border-2 px-5 py-2.5 font-semibold transition-colors ${
                selected
                  ? "border-brass-dim bg-accent text-ink"
                  : "border-rule bg-paper text-ink hover:border-rule-strong"
              }`}
            >
              {option === "jam" ? "Jam first" : "Cream first"}
            </button>
          );
        })}
      </div>

      {choice ? (
        <div className="mt-4">
          <p className="text-ink">
            <span className="font-semibold">You&apos;re with {COPY[choice].county}.</span>{" "}
            {COPY[choice].note}
          </p>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink-soft">
            Saved on this device · no tally, no server
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          Both are correct in their own county, which is the whole problem.
        </p>
      )}
    </section>
  );
}