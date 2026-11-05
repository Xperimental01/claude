"use client";
import { Event } from "@/types/event";
import { getBookingRoutes, hasVerifiedListing } from "@/lib/ticket-resolver";
import { appTargetFor, openBestTarget, storeUrlFor } from "@/lib/deeplinks";
import { useIsMobile } from "@/hooks/useIsMobile";

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

  // Device detection reads navigator, so it comes from an external-store hook
  // that returns false during the prerender — keeping hydration consistent.
  const mobile = useIsMobile();

  const hint = `${event.ticket.platform ?? ""} ${event.ticket.link ?? ""}`;
  const appTarget = appTargetFor(hint);
  const primaryUrl = routes[0]?.url;
  const storeUrl = mobile ? storeUrlFor(hint) : null;

  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
        Where to book
      </h3>

      {/* On a phone, offer the platform's own app first — it is where the
          user is signed in and where payment is one tap. */}
      {mobile && appTarget && primaryUrl && (
        <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-xs font-bold text-indigo-900">
            Open in the {appTarget.target.app} app
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-700">
            Switches to the app if it is installed, and falls back to the website otherwise.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => openBestTarget(primaryUrl, hint)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
            >
              📱 Open {appTarget.target.app}
            </button>
            {storeUrl && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:border-indigo-300"
              >
                Get the app ↗
              </a>
            )}
          </div>
        </div>
      )}

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
