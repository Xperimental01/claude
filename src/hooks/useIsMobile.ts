"use client";
import { useSyncExternalStore } from "react";
import { isMobile } from "@/lib/deeplinks";

/**
 * Whether the visitor is on a phone or tablet.
 *
 * The answer comes from `navigator`, which does not exist during the static
 * prerender, so it is read through useSyncExternalStore with a server snapshot
 * of `false`. That keeps the prerendered markup and the first client render
 * identical (no hydration mismatch) while avoiding the setState-in-effect
 * cascade that mirroring this into useState would cause.
 *
 * The user agent does not change mid-session, so `subscribe` has nothing to
 * listen to and simply returns a no-op teardown.
 */
function subscribe(): () => void {
  return () => {};
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isMobile(),
    () => false,
  );
}
