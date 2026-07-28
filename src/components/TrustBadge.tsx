"use client";
import { Event } from "@/types/event";
import { hasVerifiedListing } from "@/lib/ticket-resolver";

/**
 * Communicates data provenance. A user must never have to guess whether a
 * listing is a confirmed, purchasable event or illustrative sample content.
 */
export default function TrustBadge({
  event,
  size = "sm",
}: {
  event: Event;
  size?: "sm" | "xs";
}) {
  const verified = hasVerifiedListing(event);
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";

  if (verified) {
    return (
      <span
        title="Pulled from a ticketing provider's API. The booking link is a real listing."
        className={`inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 font-bold text-green-700 ${pad}`}
      >
        ✓ Live listing
      </span>
    );
  }

  return (
    <span
      title="Illustrative sample content — this event is not confirmed. Booking opens a search, not a purchase page."
      className={`inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 font-bold text-amber-700 ${pad}`}
    >
      ⚠ Sample data
    </span>
  );
}
