"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * ============================================================
 * A TINY LOCALSTORAGE-BACKED STORE
 * ============================================================
 * Both the passport and the scone allegiance need state that survives a
 * reload but has no business on a server. The naive version,
 * `useState` plus a `useEffect` that reads localStorage, has two problems:
 *
 *  1. It writes state synchronously inside an effect, which cascades an
 *     extra render before paint (and this project's lint rules reject it).
 *  2. Server and first client render disagree, so React logs a hydration
 *     mismatch and the UI flickers from empty to populated.
 *
 * `useSyncExternalStore` is built for exactly this: an explicit server
 * snapshot keeps hydration honest, and subscribers update without an
 * effect. The cached snapshot matters, because `getSnapshot` must return a
 * referentially stable value between changes or React re-renders forever.
 */

type Listener = () => void;

export type LocalStore<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: Listener) => () => void;
  getServerSnapshot: () => T;
};

export function createLocalStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T,
): LocalStore<T> {
  const listeners = new Set<Listener>();
  /** Cached so getSnapshot is referentially stable between writes. */
  let cache: T | undefined;
  let loaded = false;

  const read = (): T => {
    if (loaded && cache !== undefined) return cache;
    loaded = true;
    if (typeof window === "undefined") {
      cache = fallback;
      return cache;
    }
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw === null ? fallback : parse(JSON.parse(raw));
    } catch {
      // Corrupt JSON, or storage blocked (private mode, disabled cookies).
      // Neither should break the page.
      cache = fallback;
    }
    return cache;
  };

  return {
    get: read,
    set(next: T) {
      cache = next;
      loaded = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage full or blocked. Keep the in-memory value so the current
        // session still behaves; it just will not survive a reload.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      // Track the same key changing in another tab.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;
        loaded = false;
        cache = undefined;
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    getServerSnapshot: () => fallback,
  };
}

/** Read a store, plus a setter. */
export function useLocalStore<T>(store: LocalStore<T>): [T, (next: T) => void] {
  const value = useSyncExternalStore(
    store.subscribe,
    store.get,
    store.getServerSnapshot,
  );
  const set = useCallback((next: T) => store.set(next), [store]);
  return [value, set];
}