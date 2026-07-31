"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * ============================================================
 * SPLIT-FLAP TEXT — THE ACCESSIBILITY PROBLEM
 * ============================================================
 * A split-flap board works by cycling each character through a drum
 * until it reaches its target glyph. Rendered naively, that is an
 * accessibility disaster: a screen reader parked on the board would
 * read every intermediate frame, so "LEEDS" arrives as a few hundred
 * announcements of alphabet soup.
 *
 * The fix, applied here:
 *
 *  1. The animated glyphs live inside `aria-hidden`. Assistive tech
 *     never sees a single intermediate frame.
 *  2. The real value is announced once, from a polite live region owned
 *     by the parent board — after the row has settled, not during.
 *  3. `prefers-reduced-motion` is honoured in JS, not just CSS. Killing
 *     the CSS animation alone would still leave the glyph *sequence*
 *     running, which is the part that actually causes trouble. Reduced
 *     motion renders the target string directly, with no cycling at all.
 */

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-'°/";
const STEP_MS = 42;
/** Each cell starts slightly after the one to its left. */
const STAGGER_MS = 28;

/* ------------------------------------------------------------------
   prefers-reduced-motion, read as an external store.

   useSyncExternalStore is the right tool for a media query: it avoids
   the setState-in-effect cascade that a useState + useEffect version
   causes, and it takes an explicit server snapshot so hydration matches.
   ------------------------------------------------------------------ */

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void): () => void {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getMotionPreference(): boolean {
  return window.matchMedia(MOTION_QUERY).matches;
}

/** Assume motion is fine on the server; the client corrects immediately. */
function getServerMotionPreference(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
}

function normalise(
  value: string,
  width: number,
  align: "left" | "right",
): string {
  const clipped = value.toUpperCase().slice(0, width);
  return align === "right"
    ? clipped.padStart(width, " ")
    : clipped.padEnd(width, " ");
}

type SplitFlapProps = {
  value: string;
  width: number;
  /** Called once every cell has reached its target. Drives announcements. */
  onSettled?: (value: string) => void;
  className?: string;
  tone?: "flap" | "amber";
  /** Numerics right-align, as on a real board, so digits do not trail blanks. */
  align?: "left" | "right";
};

export function SplitFlap({
  value,
  width,
  onSettled,
  className = "",
  tone = "flap",
  align = "left",
}: SplitFlapProps) {
  const target = normalise(value, width, align);
  const reducedMotion = usePrefersReducedMotion();

  const [cells, setCells] = useState<string[]>(() => target.split(""));
  const [flipping, setFlipping] = useState<boolean[]>(() =>
    Array.from({ length: width }, () => false),
  );

  /*
    The glyphs currently on the drum. Kept in a ref as well as state
    because the animation effect needs to read where it is starting from
    without listing `cells` as a dependency — which would restart the
    animation on every frame it produces.
  */
  const cellsRef = useRef<string[]>(target.split(""));

  // Latest-value ref, synced in an effect rather than during render.
  // Declared before the animation effect so it is up to date when that runs.
  const settledRef = useRef(onSettled);
  useEffect(() => {
    settledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    if (reducedMotion) {
      // Nothing to animate: the render below shows `target` directly.
      cellsRef.current = target.split("");
      settledRef.current?.(target.trim());
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const from =
      cellsRef.current.length === width
        ? cellsRef.current
        : normalise(cellsRef.current.join(""), width, align).split("");

    let longest = 0;

    from.forEach((fromChar, index) => {
      const toChar = target[index];
      if (fromChar === toChar) return;

      const fromIndex = Math.max(CHARSET.indexOf(fromChar), 0);
      const toIndex = Math.max(CHARSET.indexOf(toChar), 0);
      // Always travel forward through the drum, wrapping — that is how a
      // real board behaves, and it keeps the motion coherent.
      const distance = (toIndex - fromIndex + CHARSET.length) % CHARSET.length;

      for (let step = 1; step <= distance; step += 1) {
        const glyph = CHARSET[(fromIndex + step) % CHARSET.length];
        const delay = index * STAGGER_MS + step * STEP_MS;
        longest = Math.max(longest, delay);

        timers.push(
          setTimeout(() => {
            cellsRef.current = cellsRef.current.map((c, i) =>
              i === index ? glyph : c,
            );
            setCells(cellsRef.current);
            setFlipping((previous) =>
              previous.map((f, i) => (i === index ? step < distance : f)),
            );
          }, delay),
        );
      }
    });

    if (longest === 0) {
      // Already showing the target — settle without touching state.
      settledRef.current?.(target.trim());
    } else {
      timers.push(
        setTimeout(() => {
          setFlipping(Array.from({ length: width }, () => false));
          settledRef.current?.(target.trim());
        }, longest + STEP_MS),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [target, width, reducedMotion, align]);

  // Under reduced motion the target is authoritative — no cycling state.
  const displayed = reducedMotion ? target.split("") : cells;
  const glyphColour = tone === "amber" ? "text-amber" : "text-flap";

  return (
    // aria-hidden: assistive tech is served by the board's live region.
    <span aria-hidden="true" className={`inline-flex gap-0.5 ${className}`}>
      {displayed.map((char, index) => (
        <span
          key={index}
          className={`os-flap-seam relative inline-flex h-7 w-[0.95rem] items-center justify-center rounded-xs bg-board-card font-mono text-[0.8rem] font-semibold tabular-nums ${glyphColour} ${
            !reducedMotion && flipping[index] ? "os-flap-cell" : ""
          }`}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
