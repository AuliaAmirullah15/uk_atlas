"use client";

import { useRef, useState } from "react";
import { QUESTIONS, TOTAL_QUESTIONS, scoreAnswers, type QuizAnswers } from "@/lib/quiz";
import { QuizResult } from "@/components/quiz/QuizResult";

/**
 * ============================================================
 * THE QUIZ FLOW
 * ============================================================
 * One question at a time. The accessibility work here is mostly about
 * *focus*, which is easy to get wrong in a multi-step form:
 *
 *  - Each question is a <fieldset> with a <legend>. That is what makes a
 *    screen reader read "What do you want out of the window? Radio
 *    group, 1 of 4" instead of announcing four orphaned radios.
 *  - Native radio inputs, not divs with role="radio". Arrow-key cycling,
 *    grouping by `name`, and form semantics all come free.
 *  - On advancing, focus moves to the new question heading. Without this
 *    the DOM changes under a keyboard user while their focus sits on a
 *    button that now means something else.
 *  - The result gets focus too, and is a real heading, so it is reachable
 *    and announced rather than silently swapped in below the fold.
 *  - Progress is text ("Question 3 of 6"), not just a coloured bar
 *    (SC 1.4.1: never colour alone).
 *
 * Selecting an option does NOT auto-advance. Auto-advance is hostile to
 * anyone using a screen reader or arrow keys, because moving through the
 * radios to hear them would keep submitting the form.
 */

/*
  Fading a filled burgundy pill to 40% over midnight does not read as
  "unavailable". It reads as a muddy smear that still looks
  pressable, and it drags the label down with it. A disabled primary
  instead drops the fill entirely and becomes an outline, which is
  unmistakably inert while keeping its label legible. (Disabled controls
  are exempt from SC 1.4.3, but there is no reason to make them illegible.)
*/
const PRIMARY_BUTTON =
  "rounded-md border border-brass-dim bg-accent px-5 py-2 font-semibold text-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:border-2 disabled:border-rule disabled:bg-transparent disabled:text-ink-soft";

const SECONDARY_BUTTON =
  "rounded-md border-2 border-rule px-4 py-2 font-semibold text-ink transition-colors hover:border-rule-strong";

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitted, setSubmitted] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const question = QUESTIONS[step];
  const chosen = answers[question?.id ?? ""];
  const isLast = step === TOTAL_QUESTIONS - 1;

  const goTo = (next: number) => {
    setStep(next);
    // Focus after paint, so the node exists and the move is not swallowed.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const finish = () => {
    setSubmitted(true);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setSubmitted(false);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  if (submitted) {
    return (
      <QuizResult
        scored={scoreAnswers(answers)}
        onRestart={restart}
        headingRef={resultRef}
      />
    );
  }

  return (
    <div className="rounded-lg border border-brass-dim bg-paper-alt p-5 sm:p-7">
      {/* Progress as text first, bar second. */}
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        Question {step + 1} of {TOTAL_QUESTIONS}
      </p>
      <div
        aria-hidden="true"
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-board"
      >
        <div
          className="h-full bg-brass transition-[width] duration-300"
          style={{ width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      <fieldset className="mt-6 border-0 p-0">
        {/*
          The legend carries the question. It is also the focus target on
          advance, hence tabIndex={-1}: programmatically focusable, but not
          a tab stop of its own.
        */}
        <legend className="contents">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            {question.prompt}
          </h2>
        </legend>

        <div className="mt-5 grid gap-2">
          {question.options.map((option) => {
            const id = `${question.id}-${option.id}`;
            const isChosen = chosen === option.id;
            return (
              <label
                key={option.id}
                htmlFor={id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border-2 px-4 py-3 transition-colors ${
                  isChosen
                    ? "border-accent-edge bg-paper"
                    : "border-rule bg-paper hover:border-rule-strong"
                }`}
              >
                <input
                  type="radio"
                  id={id}
                  name={question.id}
                  value={option.id}
                  checked={isChosen}
                  onChange={() =>
                    setAnswers((previous) => ({
                      ...previous,
                      [question.id]: option.id,
                    }))
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-accent-edge"
                />
                <span className="text-ink">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className={`${SECONDARY_BUTTON} disabled:cursor-not-allowed disabled:border-rule disabled:text-ink-soft disabled:opacity-50`}
        >
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={finish}
            disabled={!chosen}
            className={PRIMARY_BUTTON}
          >
            See my region
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={!chosen}
            className={PRIMARY_BUTTON}
          >
            Next
          </button>
        )}

        {/*
          Explains *why* Next is unavailable. A disabled button with no
          reason is a dead end for anyone who cannot see the radios.
        */}
        {!chosen && (
          <p className="text-sm text-ink-soft" role="status">
            Pick an answer to continue.
          </p>
        )}
      </div>
    </div>
  );
}