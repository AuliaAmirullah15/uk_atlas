export function SiteFooter() {
  return (
    <footer className="mt-16 bg-paper-alt">
      {/* Mirrors the masthead rule, flipped, so the page closes the way it
          opened. Decorative — it separates nothing that is not already a
          landmark region. */}
      <div aria-hidden="true" className="deco-rule rotate-180" />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-ink-soft sm:px-6">
        <p>
          Weather data from{" "}
          <a
            href="https://open-meteo.com/"
            className="font-semibold text-accent-bright underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>{" "}
          (CC BY 4.0). Regions follow the ONS ITL&nbsp;1 boundaries.
        </p>
        <p className="mt-2">
          An affectionate homage to Ordnance Survey cartography, printed here
          in brass on midnight. Not affiliated with, or endorsed by, Ordnance
          Survey.
        </p>
      </div>
    </footer>
  );
}
