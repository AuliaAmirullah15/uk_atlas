"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * Shared "which region is the pointer on" state, so hovering or focusing a
 * pin on the map lights up the matching row on the departure board. It is
 * the one piece of state both halves of the home page need.
 *
 * Focus counts, not just hover — otherwise the connection between map and
 * board exists only for mouse users, which is precisely the kind of
 * mouse-only flourish this project is trying to avoid.
 */

type HighlightContext = {
  highlighted: string | null;
  setHighlighted: (slug: string | null) => void;
};

const Context = createContext<HighlightContext>({
  highlighted: null,
  setHighlighted: () => {},
});

export function RegionHighlightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const value = useMemo(
    () => ({ highlighted, setHighlighted }),
    [highlighted],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRegionHighlight(): HighlightContext {
  return useContext(Context);
}