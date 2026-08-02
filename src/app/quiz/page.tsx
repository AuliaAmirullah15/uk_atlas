import type { Metadata } from "next";
import { Quiz } from "@/components/quiz/Quiz";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Which region suits you?",
  description:
    "Six questions about landscape, food, pace and weather. The departure board flaps round to the UK region that fits.",
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Which region suits you?
        </h1>
        <p className="mt-4 max-w-prose text-ink-soft">
          Six questions about what you actually want from a trip — landscape,
          pace, food, and how much rain you will tolerate. The board flaps
          round to the answer.
        </p>
        <p className="mt-2 max-w-prose text-sm text-ink-soft">
          It weights regions by what those places offer, not by what people
          there are supposedly like. Nobody needs another quiz telling them
          their personality is a county.
        </p>

        <div className="mt-8">
          <Quiz />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}