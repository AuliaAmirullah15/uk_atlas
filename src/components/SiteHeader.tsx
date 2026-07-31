import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b-4 border-postbox bg-paper-alt">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-mono text-base font-bold uppercase tracking-[0.18em] text-ink">
            The Contour Atlas
          </span>
          {/* Decorative sheet reference, in the OS house style. */}
          <span
            aria-hidden="true"
            className="hidden font-mono text-[0.65rem] tracking-wider text-ink-soft sm:inline"
          >
            1:50 000 · SHEET 1
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex list-none items-center gap-4 p-0 font-mono text-xs uppercase tracking-wider">
            <li>
              <Link href="/" className="text-ink hover:text-postbox-deep hover:underline">
                Map
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-ink hover:text-postbox-deep hover:underline"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
