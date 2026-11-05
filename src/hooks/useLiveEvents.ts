"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Event, TicketStatus } from "@/types/event";

/**
 * Live refresh for a statically-hosted site.
 *
 * There is no server to push from, so the page polls the data file that CI
 * republishes. Each poll is compared against the previous snapshot and the
 * differences are surfaced as alerts — a ticket selling out, a price moving, a
 * new event appearing.
 *
 * Two deliberate choices:
 *  - Polling pauses while the tab is hidden. A background tab hammering the
 *    CDN every minute wastes the user's battery and data for updates nobody is
 *    looking at.
 *  - A cache-busting query param is appended, because GitHub Pages serves the
 *    JSON with caching headers that would otherwise hand back a stale copy and
 *    make the feature look broken.
 */

export type ChangeKind = "sold-out" | "status" | "price" | "new";

export interface EventChange {
  kind: ChangeKind;
  eventId: string;
  eventName: string;
  detail: string;
  at: number;
}

interface Snapshot {
  status: TicketStatus;
  price?: string;
  name: string;
}

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Served path of the data file. The base path is injected at build time from
 * next.config.ts, because the site is hosted under a sub-path on GitHub Pages
 * and a root-relative fetch would miss.
 */
const FEED_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data/fetched-events.json`;

function snapshotOf(events: Event[]): Map<string, Snapshot> {
  const m = new Map<string, Snapshot>();
  for (const e of events) {
    m.set(e.id, { status: e.ticket.status, price: e.ticket.price, name: e.name });
  }
  return m;
}

function diff(prev: Map<string, Snapshot>, next: Map<string, Snapshot>): EventChange[] {
  const changes: EventChange[] = [];
  const at = Date.now();

  for (const [id, now] of next) {
    const before = prev.get(id);

    if (!before) {
      changes.push({ kind: "new", eventId: id, eventName: now.name, detail: "Newly listed", at });
      continue;
    }

    if (before.status !== now.status) {
      const soldOut = now.status === "sold-out" || now.status === "closed";
      changes.push({
        kind: soldOut ? "sold-out" : "status",
        eventId: id,
        eventName: now.name,
        detail: `${before.status} → ${now.status}`,
        at,
      });
    }

    if (before.price !== now.price && now.price) {
      changes.push({
        kind: "price",
        eventId: id,
        eventName: now.name,
        detail: `Price now ${now.price}`,
        at,
      });
    }
  }

  return changes;
}

export function useLiveEvents(initial: Event[], intervalMs = DEFAULT_INTERVAL_MS) {
  const [events, setEvents] = useState<Event[]>(initial);
  const [changes, setChanges] = useState<EventChange[]>([]);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Snapshot lives in a ref: comparing against it must not itself trigger a
  // render, and the poll callback needs the latest value without being rebuilt.
  const snapshot = useRef<Map<string, Snapshot>>(snapshotOf(initial));

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const url = `${FEED_URL}?t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const payload: unknown = await res.json();
      if (!Array.isArray(payload)) throw new Error("Unexpected payload shape");

      const fresh = payload as Event[];
      // An empty feed means no live source is connected; keep what we have
      // rather than blanking the dashboard.
      if (fresh.length === 0) {
        setLastChecked(Date.now());
        return;
      }

      const nextSnap = snapshotOf(fresh);
      const found = diff(snapshot.current, nextSnap);
      snapshot.current = nextSnap;

      setEvents(fresh);
      if (found.length) setChanges((prev) => [...found, ...prev].slice(0, 50));
      setLastChecked(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    const schedule = () => {
      window.clearTimeout(timer);
      // Only poll a tab the user is actually looking at.
      if (document.visibilityState !== "visible") return;
      timer = window.setTimeout(async () => {
        await check();
        schedule();
      }, intervalMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") schedule();
      else window.clearTimeout(timer);
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [check, intervalMs]);

  const dismissChanges = useCallback(() => setChanges([]), []);

  return { events, changes, lastChecked, checking, error, check, dismissChanges };
}
