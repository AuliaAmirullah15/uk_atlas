"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useWeatherStream } from "@/hooks/useWeatherStream";
import { usePassport } from "@/hooks/usePassport";
import type { ScoredRegion } from "@/lib/quiz";

/**
 * The reveal. The board flaps round to your region, which is the whole
 * reason to have built a split-flap in the first place.
 *
 * Accessibility follows the same split as the departure board: the flaps
 * are decoration inside `aria-hidden`, and the result is stated in real
 * text immediately beneath, not announced *instead* of being written
 * down. The heading is the focus target handed down from <Quiz>, so a
 * keyboard user lands on the result rather than somewhere above it.
 */

export function QuizResult({
  scored,
  onRestart,
  headingRef,
}: {
  scored: ScoredRegion[];
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [winner, ...rest] = scored;
  const runnersUp = rest.filter((entry) => entry.score > 0).slice(0, 2);
  const { observations } = useWeatherStream();
  const { stamp } = usePassport();
  const [settled, setSettled] = useState(false);

  const observation = observations.get(winner.region.slug);

  return (
    <div className="rounded-lg border border-brass-dim bg-paper-alt p-5 sm:p-7">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        Your result
      </p>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
      >
        You should go to {winner.region.name}
      </h2>

      {/* The flap board. Decorative; the name is in the heading above. */}
      <div className="mt-5 rounded-md bg-board p-4">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-flap/50">
          Next departure
        </p>
        <div className="mt-2">
          <SplitFlap
            value={winner.region.boardName}
            width={11}
            onSettled={() => setSettled(true)}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-flap/70">
          <span>{winner.match}% match</span>
          {observation ? (
            <span>
              Currently {observation.tempC}°C, {observation.conditionLabel.toLowerCase()}
            </span>
          ) : (
            <span>Fetching current conditions…</span>
          )}
        </div>
      </div>

      <p className="mt-5 max-w-prose text-ink-soft">{winner.region.blurb}</p>

      <p className="mt-4 border-l-4 border-accent-edge pl-3 text-sm">
        <span className="font-semibold text-ink">
          &ldquo;{winner.region.phrase.text}&rdquo;
        </span>{" "}
        <span className="text-ink-soft">({winner.region.phrase.gloss})</span>
      </p>

      {/* Eat this, essentially. */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
            Eat
          </h3>
          <ul className="mt-2 m-0 list-none p-0 text-sm">
            {winner.region.food.slice(0, 3).map((item) => (
              <li key={item.name} className="mt-1 text-ink">
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
            Time it with
          </h3>
          <ul className="mt-2 m-0 list-none p-0 text-sm">
            {winner.region.festivals.slice(0, 2).map((festival) => (
              <li key={festival.name} className="mt-1 text-ink">
                {festival.name}{" "}
                <span className="text-ink-soft">({festival.when})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {runnersUp.length > 0 && (
        <div className="mt-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
            Also worth a look
          </h3>
          <ul className="mt-2 m-0 flex list-none flex-wrap gap-2 p-0">
            {runnersUp.map((entry) => (
              <li key={entry.region.slug}>
                <Link
                  href={`/region/${entry.region.slug}`}
                  className="inline-flex items-baseline gap-2 rounded-full border border-rule bg-paper px-3 py-1 text-sm text-ink hover:border-accent-edge"
                >
                  {entry.region.name}
                  <span className="font-mono text-[0.65rem] text-ink-soft">
                    {entry.match}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href={`/region/${winner.region.slug}`}
          onClick={() => stamp(winner.region.slug)}
          className="rounded-md border border-brass-dim bg-accent px-5 py-2 font-semibold text-ink transition-colors hover:bg-accent-hover"
        >
          Explore {winner.region.name}
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md border-2 border-rule px-4 py-2 font-semibold text-ink transition-colors hover:border-rule-strong"
        >
          Start again
        </button>
      </div>

      {/*
        Announced once the flaps have settled, so assistive tech gets the
        result as a single sentence rather than mid-flip nonsense.
      */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {settled
          ? `Your result: ${winner.region.name}, ${winner.match}% match.`
          : ""}
      </p>
    </div>
  );
}