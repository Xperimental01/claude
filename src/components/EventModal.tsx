"use client";
import { useState } from "react";
import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import CategoryBadge from "./CategoryBadge";
import { googleCalendarUrl, mapsUrl, downloadIcs } from "@/lib/links";
import { resolveTicketUrl, bookingButtonLabel, canBook } from "@/lib/ticket-resolver";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { format, parseISO } from "date-fns";

function fmt(d: string) {
  try { return format(parseISO(d), "EEEE, dd MMMM yyyy"); } catch { return d; }
}

function ShareButton({ event }: { event: Event }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `${event.name} — ${fmt(event.date)} at ${event.venue}, ${event.area}`;
    const url = resolveTicketUrl(event);
    if (navigator.share) {
      try { await navigator.share({ title: event.name, text, url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 transition-colors"
    >
      {copied ? "✅ Copied!" : "🔗 Share"}
    </button>
  );
}

export default function EventModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const meta = CATEGORY_META[event.category];
  const statusMeta = TICKET_STATUS_META[event.ticket.status];
  const { isSaved, toggle } = useSavedEvents();
  const saved = isSaved(event.id);
  const bookable = canBook(event);
  const ticketUrl = resolveTicketUrl(event);
  const btnLabel = bookingButtonLabel(event);

  const deadlinePassed =
    !!event.ticket.registrationDeadline &&
    new Date(event.ticket.registrationDeadline) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colour stripe */}
        <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${
          event.featured
            ? "from-indigo-500 via-purple-500 to-pink-500"
            : "from-slate-300 to-slate-200"
        }`} />

        {/* Header */}
        <div className={`px-6 pt-5 pb-4 ${meta.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <CategoryBadge category={event.category} />
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-snug">{event.name}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggle(event.id)}
                title={saved ? "Remove bookmark" : "Save event"}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors text-lg ${
                  saved
                    ? "bg-amber-400 border-amber-400 text-white"
                    : "bg-white border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-400"
                }`}
              >
                {saved ? "★" : "☆"}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Date / time / venue */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span>📅</span>
              <span className="font-semibold">{fmt(event.date)}</span>
              {event.endDate && event.endDate !== event.date && (
                <span className="text-slate-500">→ {fmt(event.endDate)}</span>
              )}
              <span className="text-slate-500">· {event.time}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <span>📍</span>
              <span>{event.venue}, {event.address}, {event.area}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{event.format === "in-person" ? "🏛" : event.format === "hybrid" ? "🔀" : "💻"}</span>
              <span className="capitalize">{event.format}</span>
              {event.expectedAttendees && <span>· 👥 {event.expectedAttendees}</span>}
              <span>· 🏢 {event.organizer}</span>
            </div>
          </div>
        </div>

        {/* Quick-action buttons */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap gap-2">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-lg px-3 py-2 transition-colors"
          >
            📅 Add to Calendar
          </a>
          <button
            onClick={() => downloadIcs(event)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-purple-300 hover:text-purple-600 rounded-lg px-3 py-2 transition-colors"
          >
            ⬇ Download .ics
          </button>
          <a
            href={mapsUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-green-300 hover:text-green-600 rounded-lg px-3 py-2 transition-colors"
          >
            🗺 Get Directions
          </a>
          <ShareButton event={event} />
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Highlights */}
          {event.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What To Expect</h3>
              <ul className="space-y-1.5">
                {event.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>{h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Organiser</div>
              <div className="text-sm font-semibold text-slate-800 mt-0.5">{event.organizer}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Booking Platform</div>
              <div className="text-sm font-semibold text-slate-800 mt-0.5">{event.ticket.platform ?? "—"}</div>
            </div>
            {event.ticket.registrationDeadline && (
              <div className={`rounded-lg p-3 border col-span-2 ${deadlinePassed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-100"}`}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Registration Deadline</div>
                <div className={`text-sm font-bold mt-0.5 ${deadlinePassed ? "text-red-600" : "text-green-700"}`}>
                  {fmt(event.ticket.registrationDeadline)}{deadlinePassed ? " — CLOSED" : ""}
                </div>
              </div>
            )}
          </div>

          {/* Ticket tiers */}
          {event.ticket.tiers && event.ticket.tiers.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Ticket Tiers</h3>
              <div className="space-y-2">
                {event.ticket.tiers.map((tier, i) => {
                  const ts = TICKET_STATUS_META[tier.status];
                  const out = tier.status === "sold-out";
                  return (
                    <div key={i} className={`rounded-lg border p-3 flex items-start justify-between gap-3 ${out ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{tier.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${ts.bg} ${ts.color} ${ts.border}`}>
                            {ts.label}
                          </span>
                        </div>
                        {tier.perks && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tier.perks.map((p, j) => (
                              <span key={j} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-black shrink-0 ${out ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {tier.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Booking steps */}
          {event.ticket.bookingSteps && event.ticket.bookingSteps.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                How To Book — Step by Step
              </h3>
              <ol className="space-y-2.5">
                {event.ticket.bookingSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sticky booking footer */}
        <div className={`sticky bottom-0 px-6 py-4 border-t ${meta.bg} rounded-b-2xl flex items-center justify-between gap-3`}>
          <div>
            <div className="text-sm font-black text-slate-900">{event.ticket.price ?? "N/A"}</div>
            <div className="text-xs text-slate-500">via {event.ticket.platform ?? "official site"}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Always show a button — worst case it opens Google search */}
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm ${
                bookable && !deadlinePassed
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-600"
              }`}
            >
              {bookable && !deadlinePassed ? btnLabel : "Search Online →"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
