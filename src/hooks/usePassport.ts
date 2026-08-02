"use client";

import { useCallback } from "react";
import { createLocalStore, useLocalStore } from "@/lib/store";
import { REGIONS } from "@/lib/regions";

/**
 * The passport: which regions you have looked at, stamped on the sheet.
 *
 * Local to the device by design: there are no accounts here, and adding a
 * backend to store "pages you visited" would be a lot of privacy surface
 * for a collectathon. The UI says so plainly rather than implying a
 * synced profile.
 */

const VALID = new Set(REGIONS.map((region) => region.slug));

/** Slug → ISO timestamp of first visit. */
export type Passport = Record<string, string>;

const store = createLocalStore<Passport>("uk-atlas-passport", {}, (raw) => {
  if (typeof raw !== "object" || raw === null) return {};
  const entries = Object.entries(raw as Record<string, unknown>)
    // Drop anything that is not a region we still ship, so a renamed slug
    // cannot resurrect as a phantom stamp.
    .filter(([slug, at]) => VALID.has(slug) && typeof at === "string");
  return Object.fromEntries(entries) as Passport;
});

export function usePassport() {
  const [passport, setPassport] = useLocalStore(store);

  const stamp = useCallback(
    (slug: string) => {
      if (!VALID.has(slug)) return;
      const current = store.get();
      // First visit wins, so the date means something.
      if (current[slug]) return;
      setPassport({ ...current, [slug]: new Date().toISOString() });
    },
    [setPassport],
  );

  const reset = useCallback(() => setPassport({}), [setPassport]);

  const collected = Object.keys(passport).length;

  return {
    passport,
    stamp,
    reset,
    collected,
    total: REGIONS.length,
    has: (slug: string) => Boolean(passport[slug]),
    complete: collected === REGIONS.length,
  };
}