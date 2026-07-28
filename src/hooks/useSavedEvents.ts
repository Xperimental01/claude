"use client";
import { useCallback, useSyncExternalStore } from "react";

const KEY = "delhi-ncr-saved-events";

/**
 * Bookmarks live in localStorage, which is an external store rather than React
 * state. useSyncExternalStore is the right primitive for that: it subscribes,
 * supplies a server snapshot for the static prerender, and avoids the
 * setState-inside-an-effect cascade that an effect-based read causes.
 */

/** Stable empty reference — returning a fresh [] each read would loop forever. */
const EMPTY: readonly string[] = Object.freeze([]);

const listeners = new Set<() => void>();

/** Cached parse, keyed on the raw string, so snapshots stay referentially stable. */
let cachedRaw: string | null = null;
let cachedValue: readonly string[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = EMPTY;
    return cachedValue;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    cachedValue = Array.isArray(parsed)
      ? (parsed.filter((v) => typeof v === "string") as string[])
      : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

/** Nothing is bookmarked during the static prerender. */
function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  // Another tab changed the list; invalidate and re-read.
  if (e.key === KEY) {
    cachedRaw = null;
    emit();
  }
}

function subscribe(onStoreChange: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota or private-browsing failure: keep the in-memory value so the UI
    // still responds, rather than silently reverting the user's click.
  }
  cachedRaw = null;
  emit();
}

export function useSavedEvents() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    write(current.includes(id) ? current.filter((s) => s !== id) : [...current, id]);
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle, count: saved.length };
}
