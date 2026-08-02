import Link from "next/link";

/*
  The masthead. A Deco poster header is a stack of rules of differing
  weight, not one heavy border, so the bottom edge is a .deco-rule
  (thick brass line, hairline gap, thin brass line) rather than the single
  chunky band a `border-b-4` gives you.
*/

const LINKS = [
  { href: "/", label: "Map" },
  { href: "/quiz", label: "Quiz" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="bg-paper-alt">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-lg font-semibold tracking-[0.13em] text-ink uppercase transition-colors group-hover:text-brass">
            The Contour Atlas
          </span>
          {/* Decorative sheet reference, in the OS house style. */}
          <span
            aria-hidden="true"
            className="hidden font-mono text-[0.65rem] tracking-wider text-brass sm:inline"
          >
            1:50 000 · SHEET 1 · NIGHT ED.
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex list-none items-center gap-5 p-0 font-mono text-xs uppercase tracking-[0.12em]">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink transition-colors hover:text-brass hover:underline hover:decoration-brass hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Decorative: carries no meaning the nav above does not already state. */}
      <div aria-hidden="true" className="deco-rule" />
    </header>
  );
}
