"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "delhi-ncr-saved-events";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useSavedEvents() {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(read());
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSaved(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSaved(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      persist(saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id]);
    },
    [saved, persist]
  );

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle, hydrated, count: saved.length };
}
