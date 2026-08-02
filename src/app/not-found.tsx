import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Off the edge of the sheet
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          There is no map for that
        </h1>
        <p className="mt-4 text-ink-soft">
          The page you asked for is not in this atlas. It happens — grid
          references are fiddly.
        </p>
        <p className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-md bg-accent px-4 py-2 font-semibold text-paper hover:bg-accent-bright"
          >
            Back to the map
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
