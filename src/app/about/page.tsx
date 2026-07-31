import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About",
  description:
    "How the Contour Atlas streams live weather, and the accessibility decisions behind the split-flap board.",
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-mono text-sm uppercase tracking-[0.2em] text-postbox-deep">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          About this atlas
        </h1>

        <H2>How &ldquo;live&rdquo; the weather really is</H2>
        <p className="mt-3 text-ink-soft">
          Open-Meteo is a plain REST API with no push channel, and the readings
          it returns carry a 15-minute interval. So nothing here is a firehose:
          a server-side poller asks for all twelve regions in a single request
          every 60 seconds, and publishes only the readings that actually
          changed. Claiming per-second weather would be a lie told with
          animation.
        </p>
        <p className="mt-3 text-ink-soft">
          The browser receives those changes over Server-Sent Events. SSE is
          the right fit because the traffic is one-directional and it reconnects
          by itself, sending a <code className="font-mono text-sm">Last-Event-ID</code>{" "}
          header that the server treats as a resume offset — so a dropped
          connection does not drop observations.
        </p>

        <H2>Why the split-flap board is hidden from screen readers</H2>
        <p className="mt-3 text-ink-soft">
          A split-flap board reaches its destination by cycling every character
          through a drum. Rendered naively, a screen reader would announce each
          intermediate frame, turning &ldquo;Leeds&rdquo; into several hundred
          utterances of alphabet soup.
        </p>
        <p className="mt-3 text-ink-soft">
          So the flipping glyphs sit inside{" "}
          <code className="font-mono text-sm">aria-hidden</code>, and the real
          values are announced from a single polite live region once the rows
          have settled — batched into one sentence, because twelve regions
          updating at once would otherwise mean twelve interruptions. If you
          have asked your system to reduce motion, the flaps do not cycle at
          all: values change straight to their target.
        </p>
        <p className="mt-3 text-ink-soft">
          The board also has a genuine pause control. Automatically updating
          content needs one (WCAG 2.1 success criterion 2.2.2), and pausing
          closes the stream rather than merely hiding it.
        </p>

        <H2>Colour</H2>
        <p className="mt-3 text-ink-soft">
          Every colour that carries text was checked against the paper
          background before it went in: nothing textual sits below 4.5:1, and
          most is above 7:1. The contour brown fails text contrast at 2.35:1,
          which is why it is only ever texture — no information is encoded in
          the contour lines or the grid squares alone.
        </p>

        <H2>Regions</H2>
        <p className="mt-3 text-ink-soft">
          The twelve regions are the ONS ITL&nbsp;1 statistical regions, so the
          geography is defensible rather than improvised. The map itself is
          stylised and not to scale, which is exactly why every region is also
          listed as plain text beneath it.
        </p>

        <p className="mt-10">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider text-postbox-deep underline"
          >
            ← Back to the map
          </Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
