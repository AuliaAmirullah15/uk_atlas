/*
  WCAG 2.1 contrast gate for the Midnight Deco palette.  `npm run check:contrast`
  ============================================================================
  Reads the tokens actually shipped in src/app/globals.css — not a copy of them —
  and re-checks every foreground/background pairing that appears in the
  components, including Tailwind's /NN alpha modifiers composited over the
  backdrop they really sit on. A `text-flap/45` looks fine in a class list and
  lands at 4.04:1 in the browser; only compositing catches that.

  Exits non-zero on any failure, so it can gate CI.

  Deliberately NOT covered, because nothing informational rests on them:
    - the contour and grid textures (aria-hidden decoration)
    - the map's land/sea fills (the SVG is role="presentation"; the coastline
      is drawn in brass and every pin is also a text entry in the list below)
    - disabled controls, which SC 1.4.3 exempts

  If you add a colour pairing to a component, add it here too.
*/
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const theme = css.slice(css.indexOf("@theme"), css.indexOf("}", css.indexOf("@theme")));
const T = Object.fromEntries(
  [...theme.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]),
);

/*
  Derived backdrop, not a token: a single herringbone thread is the .tweed
  background-color (brass at TWEED_ALPHA) composited onto a card. It is the
  lightest surface any text can land on, so it is the worst case to check.
  Kept in step with the `color-mix` percentage in .tweed.
*/
const TWEED_ALPHA =
  Number(/\.tweed\s*\{[^}]*?--color-brass\)\s*(\d+)%/s.exec(css)?.[1]) / 100;
if (!Number.isFinite(TWEED_ALPHA)) throw new Error("could not read .tweed alpha from globals.css");

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));
const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = (r) => 0.2126 * lin(r[0]) + 0.7152 * lin(r[1]) + 0.0722 * lin(r[2]);
const ratio = (a, b) => { const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (f, b, a) => "#" + hex(f).map((c, i) => Math.round(c * a + hex(b)[i] * (1 - a)).toString(16).padStart(2, "0")).join("");

/** [what, fg token, alpha, bg token, threshold, where it is used] */
const CHECKS = [
  // Body and secondary copy on both page surfaces
  ["text", "ink", 1, "paper", 4.5, "body copy"],
  ["text", "ink", 1, "paper-alt", 4.5, "body copy on cards"],
  ["text", "ink-soft", 1, "paper", 4.5, "secondary copy"],
  ["text", "ink-soft", 1, "paper-alt", 4.5, "secondary copy on cards"],
  ["text", "brass", 1, "paper", 4.5, "section labels"],
  ["text", "brass", 1, "paper-alt", 4.5, "section labels on cards"],
  ["text", "accent-bright", 1, "paper", 4.5, "links, small coral text"],
  ["text", "accent-bright", 1, "paper-alt", 4.5, "links on cards"],

  // Dark label on filled pills
  ["text", "paper", 1, "accent", 4.5, "label on primary button"],
  ["text", "paper", 1, "accent-bright", 4.5, "label on button hover"],
  ["text", "paper", 1, "brass", 4.5, "label on skip link"],

  // Departure board
  ["text", "flap", 1, "board", 4.5, "board glyphs"],
  ["text", "flap", 1, "board-card", 4.5, "split-flap cells"],
  ["text", "amber", 1, "board-card", 4.5, "temperature glyphs"],
  ["text", "brass", 1, "board", 4.5, "board heading"],
  ["text", "flap", 0.5, "board", 4.5, "offset / eyebrow"],
  ["text", "flap", 0.6, "board", 4.5, "column headers, units"],
  ["text", "flap", 0.7, "board", 4.5, "region names, timestamp"],
  ["text", "flap", 0.8, "board", 4.5, "status pill"],
  ["text", "amber", 0.9, "board", 4.5, "verdict column"],
  ["text", "woodland", 1, "board", 4.5, "live dot"],

  // Worst-case backdrop: directly on a herringbone thread, where the weave
  // lightens paper-alt the most. Text is laid out to avoid the strong part of
  // the fade, but it must still clear 4.5:1 if it ever lands on a thread.
  ["text", "ink", 1, "tweed-thread", 4.5, "body copy on a weave thread"],
  ["text", "ink-soft", 1, "tweed-thread", 4.5, "lede on a weave thread"],
  ["text", "brass", 1, "tweed-thread", 4.5, "eyebrow / drop cap on a thread"],

  // Non-text: borders, rules, state indicators
  ["non-text", "rule", 1, "paper", 3.0, "hairline on ground"],
  ["non-text", "rule", 1, "paper-alt", 3.0, "hairline on cards"],
  ["non-text", "rule-strong", 1, "paper", 3.0, "hover border"],
  ["non-text", "rule-strong", 1, "paper-alt", 3.0, "hover border on cards"],
  ["non-text", "brass-dim", 1, "paper", 3.0, "card frame"],
  ["non-text", "brass-dim", 1, "paper-alt", 3.0, "card frame, inner"],
  ["non-text", "brass-dim", 1, "board", 3.0, "board frame"],
  ["non-text", "accent", 1, "paper-alt", 3.0, "STATE: selected / stamped"],
  ["non-text", "accent", 1, "board", 3.0, "STATE: highlighted row edge"],
  ["non-text", "board-rule", 1, "board", 3.0, "board dividers, pause button"],
  ["non-text", "brass", 1, "paper", 3.0, "FOCUS RING on ground"],
  ["non-text", "brass", 1, "paper-alt", 3.0, "FOCUS RING on cards"],
  ["non-text", "brass", 1, "board", 3.0, "FOCUS RING on board"],
];

let failures = 0;
const width = Math.max(...CHECKS.map((c) => c[5].length));

T["tweed-thread"] = over(T.brass, T["paper-alt"], TWEED_ALPHA);

for (const [kind, fg, alpha, bg, need, where] of CHECKS) {
  if (!T[fg] || !T[bg]) { console.log(`?? missing token ${fg} / ${bg}`); failures++; continue; }
  const composited = alpha === 1 ? T[fg] : over(T[fg], T[bg], alpha);
  const r = ratio(composited, T[bg]);
  const ok = r >= need;
  if (!ok) failures++;
  const name = alpha === 1 ? fg : `${fg}/${alpha * 100}`;
  console.log(
    `${ok ? " " : "✗"} ${where.padEnd(width)}  ${name.padEnd(16)} on ${bg.padEnd(10)} ` +
    `${r.toFixed(2).padStart(6)}  need ${need.toFixed(1)}  ${kind}`,
  );
}

console.log(`\n${CHECKS.length - failures}/${CHECKS.length} pass — ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
