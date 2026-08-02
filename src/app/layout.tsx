import type { Metadata } from "next";
import { Fraunces, Karla, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/*
  Three faces, each doing one job.

  Fraunces for display. It is an old-style serif with a WONK axis, which
  is the whole reason it is here: it carries the engraved, slightly
  theatrical feel a Deco masthead needs without tipping into the fragile
  hairline faces that go illegible below 24px. opsz is pinned high so the
  headings get the display cut's sharper contrast.

  Karla for prose. A grotesque with a tall x-height and open apertures.
  That openness is what keeps body copy comfortable on a dark ground, where
  a tighter face fills in and starts to glow.

  IBM Plex Mono for the board and every OS-style label. A monospace with
  proper tabular figures matters on the departure board: proportional
  digits make the temperature column jitter as values change. Plex also
  ships real 500/600 weights, so the semibold labels are drawn rather
  than synthesised into a smeared faux-bold.
*/
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Contour Atlas: A Field Guide to the UK",
    template: "%s | The Contour Atlas",
  },
  description:
    "Tourism, food, festivals and live weather for all twelve regions of the United Kingdom, drawn as an Ordnance Survey sheet printed in brass on midnight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      /*
        color-scheme: dark is not cosmetic. It is what makes the scrollbars,
        form controls and the flash before first paint render dark, instead
        of the browser handing us light chrome around a midnight page.
      */
      className={`${fraunces.variable} ${karla.variable} ${plexMono.variable} h-full scheme-dark antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {/*
          First focusable element on the page. Visually hidden until
          focused, then pinned top-left (SC 2.4.1 Bypass Blocks).
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-brass focus:px-4 focus:py-2 focus:font-semibold focus:text-paper focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
