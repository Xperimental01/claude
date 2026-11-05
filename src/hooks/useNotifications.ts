"use client";
import { useCallback, useSyncExternalStore } from "react";
import { EventChange } from "./useLiveEvents";

/**
 * Browser notifications for ticket-status changes.
 *
 * Permission is never requested on load. Browsers penalise unsolicited
 * permission prompts, and a prompt nobody asked for is noise — so the request
 * only happens when the user explicitly turns alerts on.
 *
 * `Notification.permission` is state owned by the browser, not by React, so it
 * is read through useSyncExternalStore rather than mirrored into useState via
 * an effect (which would cascade a render on every mount).
 *
 * Everything degrades: if Notification is unsupported or denied, the in-page
 * alert feed still shows the same changes.
 */

export type PermissionState = "unsupported" | "default" | "granted" | "denied";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function getSnapshot(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as PermissionState;
}

/** Nothing is granted during the static prerender. */
function getServerSnapshot(): PermissionState {
  return "unsupported";
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);

  // Where supported, the Permissions API reports changes made in browser
  // settings, so revoking permission updates the UI without a reload.
  let permissionStatus: PermissionStatus | null = null;
  let cancelled = false;

  if (typeof navigator !== "undefined" && navigator.permissions?.query) {
    navigator.permissions
      .query({ name: "notifications" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        permissionStatus = status;
        status.addEventListener("change", emit);
      })
      .catch(() => {
        // Firefox historically rejected this query; the manual emit after
        // requestPermission() still keeps the UI correct.
      });
  }

  return () => {
    cancelled = true;
    listeners.delete(onStoreChange);
    permissionStatus?.removeEventListener("change", emit);
  };
}

export function useNotifications() {
  const permission = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const request = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const result = await Notification.requestPermission();
      emit();
      return result === "granted";
    } catch {
      // Older Safari only supported the callback form and can reject here.
      emit();
      return false;
    }
  }, []);

  const notify = useCallback(
    (title: string, body: string, tag?: string) => {
      if (permission !== "granted") return;
      try {
        // `tag` collapses repeat alerts for the same event instead of stacking.
        const icon = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/favicon.ico`;
        new Notification(title, { body, tag, icon });
      } catch {
        // Some browsers only permit notifications from a service worker.
        // The in-page feed already covers this case, so fail quietly.
      }
    },
    [permission],
  );

  return { permission, request, notify };
}

/** Title and body for a change, shaped for a notification. */
export function describeChange(change: EventChange): { title: string; body: string } {
  switch (change.kind) {
    case "sold-out":
      return { title: "Tickets gone", body: `${change.eventName} is now sold out or closed.` };
    case "price":
      return { title: "Price changed", body: `${change.eventName}: ${change.detail}` };
    case "new":
      return { title: "New event", body: `${change.eventName} was just listed.` };
    default:
      return { title: "Ticket status changed", body: `${change.eventName}: ${change.detail}` };
  }
}
