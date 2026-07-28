"use client";
import { Event } from "@/types/event";
import { getBookingRoutes, hasVerifiedListing } from "@/lib/ticket-resolver";

/**
 * Renders every route to a bookable page for an event, best-first.
 *
 * Offering several routes is deliberate: a single guessed deep link can 404
 * (and did), whereas a search-based route always resolves. The user is never
 * left at a dead end.
 */
export default function BookingHub({ event }: { event: Event }) {
  const routes = getBookingRoutes(event);
  const verified = hasVerifiedListing(event);

  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
        Where to book
      </h3>

      {!verified && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs leading-relaxed text-amber-900">
            <strong>This is sample data.</strong> This event has not been confirmed against a
            ticketing provider, so there is no verified purchase page to send you to. The routes
            below run a live search so you can find the real event if it exists.
          </p>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {routes.map((route) => (
          <a
            key={route.url}
            href={route.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <span className="mt-0.5 shrink-0 text-base">{route.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{route.label}</span>
                {route.reliability === "guaranteed" && (
                  <span className="rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                    always loads
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                {route.note}
              </span>
            </span>
            <span className="mt-0.5 shrink-0 text-xs text-slate-300">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
