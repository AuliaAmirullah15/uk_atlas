import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REGIONS, getRegion } from "@/lib/regions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StampOnVisit } from "@/components/PassportPanel";

/** All twelve regions are known at build time, so prerender the lot. */
export function generateStaticParams() {
  return REGIONS.map((region) => ({ slug: region.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) return { title: "Region not found" };

  return {
    title: region.name,
    description: region.blurb,
  };
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-rule bg-paper p-5">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Resolved before any Suspense boundary, so a bad slug still yields a
  // real HTTP 404 rather than a 200 with error UI streamed into it.
  const { slug } = await params;
  const region = getRegion(slug);
  if (!region) notFound();

  return (
    <>
      {/* Records the visit in the local passport. Renders nothing, and is
          the only client-side leaf on this otherwise prerendered page. */}
      <StampOnVisit slug={region.slug} />

      <SiteHeader />

      <main
        id="main"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6"
      >
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-brass hover:underline"
          >
            ← Back to the map
          </Link>
        </nav>

        <header className="deco-corners relative overflow-hidden rounded-lg border border-brass-dim bg-paper-alt p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="os-contours absolute inset-0 opacity-70"
          />
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
              {region.nation}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {region.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-ink-soft">
              {region.blurb}
            </p>

            <p className="mt-5 border-l-4 border-accent-edge pl-3 text-sm">
              <span className="font-semibold text-ink">
                &ldquo;{region.phrase.text}&rdquo;
              </span>{" "}
              <span className="text-ink-soft">({region.phrase.gloss})</span>
            </p>
          </div>
        </header>

        {/* items-start so panels hug their content, because the festivals and
            landmarks lists are much shorter than the food list, and
            equal-height cards leave them with dead space. */}
        <div className="mt-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <Panel title="Local food">
            <ul className="m-0 grid list-none gap-3 p-0">
              {region.food.map((item) => (
                <li key={item.name}>
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="text-sm text-ink-soft">{item.note}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Festivals &amp; events">
            {/*
              A description list is the honest markup here: each festival
              name maps to its date and place.
            */}
            <dl className="m-0 grid gap-3">
              {region.festivals.map((festival) => (
                <div key={festival.name}>
                  <dt className="font-semibold text-ink">{festival.name}</dt>
                  <dd className="ml-0 text-sm text-ink-soft">
                    {festival.when} · {festival.where}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Landmarks">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {region.landmarks.map((landmark) => (
                <li
                  key={landmark}
                  className="rounded-full border border-rule bg-paper-alt px-3 py-1 text-sm text-ink"
                >
                  {landmark}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Grid reference">
            <dl className="m-0 grid grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">
                  Station
                </dt>
                <dd className="ml-0 mt-1 text-ink">{region.city}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">
                  Latitude
                </dt>
                <dd className="ml-0 mt-1 text-ink">
                  {region.lat.toFixed(4)}°N
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink-soft">
                  Longitude
                </dt>
                <dd className="ml-0 mt-1 text-ink">
                  {Math.abs(region.lon).toFixed(4)}°{region.lon < 0 ? "W" : "E"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink-soft">
              These coordinates are what the departure board sends to Open-Meteo
              for this region.
            </p>
          </Panel>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
