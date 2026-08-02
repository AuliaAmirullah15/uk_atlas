import Link from "next/link";
import { DepartureBoard } from "@/components/DepartureBoard";
import { RegionMap } from "@/components/RegionMap";
import { RegionHighlightProvider } from "@/components/RegionHighlight";
import { PassportPanel } from "@/components/PassportPanel";
import { SconeAllegiance } from "@/components/SconeAllegiance";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/*
          One h1 per page, and it is the page's real subject. The board and
          map are h2 sections beneath it, so the heading outline reads as a
          sensible table of contents in a screen reader's heading list.
        */}
        {/*
          The hero frame. Both decorative layers are aria-hidden and sit
          behind a `relative` content wrapper, so the sunburst rays and the
          corner brackets never enter the accessibility tree or the text flow.
        */}
        <div className="deco-corners relative overflow-hidden rounded-lg border border-rule bg-paper-alt px-5 py-8 sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="deco-sunburst pointer-events-none absolute inset-0"
          />

          <div className="relative">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-brass">
              Ordnance Survey · Night Edition
            </p>

            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              A field guide to the twelve regions of the{" "}
              <span className="text-brass italic">United Kingdom</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-ink-soft">
              Contour lines, brass hairlines, and a station board that will not
              stop telling you it is drizzling somewhere. Food, festivals and
              landmarks for every region — plus live weather, streamed.
            </p>

            <p className="mt-7">
              <Link
                href="/quiz"
                className="inline-block rounded-md bg-accent px-5 py-2.5 font-semibold text-paper transition-colors hover:bg-accent-bright"
              >
                Find the region that suits you →
              </Link>
            </p>
          </div>
        </div>

        {/*
          The provider wraps both board and map so hovering or focusing a pin
          can light up the matching board row.
        */}
        <RegionHighlightProvider>
          <div className="mt-10">
            <DepartureBoard />
          </div>

          <div className="mt-14">
            <RegionMap />
          </div>
        </RegionHighlightProvider>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:items-start">
          <PassportPanel />
          <SconeAllegiance />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}