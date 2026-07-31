export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-grid/40 bg-paper-alt">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-ink-soft sm:px-6">
        <p>
          Weather data from{" "}
          <a
            href="https://open-meteo.com/"
            className="font-semibold text-postbox-deep underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>{" "}
          (CC BY 4.0). Regions follow the ONS ITL&nbsp;1 boundaries.
        </p>
        <p className="mt-2">
          An affectionate homage to Ordnance Survey cartography. Not affiliated
          with, or endorsed by, Ordnance Survey.
        </p>
      </div>
    </footer>
  );
}
