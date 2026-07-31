import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

/*
  Inter for prose; Roboto Mono for the board and every OS-style label.
  A monospace with proper tabular figures matters on the departure board:
  proportional digits make the temperature column jitter as values change.
*/
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Contour Atlas — A Field Guide to the UK",
    template: "%s | The Contour Atlas",
  },
  description:
    "Tourism, food, festivals and live weather for all twelve regions of the United Kingdom, drawn in the style of an Ordnance Survey sheet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {/*
          First focusable element on the page. Visually hidden until
          focused, then pinned top-left (SC 2.4.1 Bypass Blocks).
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-postbox focus:px-4 focus:py-2 focus:font-semibold focus:text-paper focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
