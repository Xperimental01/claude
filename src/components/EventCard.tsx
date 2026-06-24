"use client";
import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import CategoryBadge from "./CategoryBadge";
import Countdown from "./Countdown";
import { resolveTicketUrl, canBook } from "@/lib/ticket-resolver";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { format, parseISO, differenceInDays } from "date-fns";

function fmt(d: string) {
  try { return format(parseISO(d), "dd MMM yyyy"); } catch { return d; }
}

function daysLabel(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ev = new Date(dateStr); ev.setHours(0, 0, 0, 0);
  const diff = differenceInDays(ev, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return null; // past — shouldn't appear
  return `In ${diff}d`;
}

export default function EventCard({
  event,
  onOpenDetail,
}: {
  event: Event;
  onOpenDetail: (e: Event) => void;
}) {
  const meta = CATEGORY_META[event.category];
  const status = TICKET_STATUS_META[event.ticket.status];
  const { isSaved, toggle } = useSavedEvents();
  const saved = isSaved(event.id);
  const bookable = canBook(event);
  const ticketUrl = resolveTicketUrl(event);
  const dayLabel = daysLabel(event.date);
  const isUrgent = dayLabel === "Today" || dayLabel === "Tomorrow";
  const isSoldOut = !bookable;

  const deadlinePassed =
    !!event.ticket.registrationDeadline &&
    new Date(event.ticket.registrationDeadline) < new Date();

  // Show countdown only if event is within 30 days and not sold out
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date); eventDate.setHours(0, 0, 0, 0);
  const daysAway = differenceInDays(eventDate, today);
  const showCountdown = daysAway >= 0 && daysAway <= 30 && !isSoldOut;

  return (
    <div
      className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group ${
        event.featured ? "ring-2 ring-indigo-400" : "border-slate-200"
      } ${isSoldOut ? "opacity-70" : ""}`}
      onClick={() => onOpenDetail(event)}
    >
      {/* Featured stripe */}
      {event.featured && (
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}

      {/* Bookmark button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggle(event.id); }}
        title={saved ? "Remove bookmark" : "Save event"}
        className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center border text-sm transition-colors opacity-0 group-hover:opacity-100 ${
          saved
            ? "opacity-100 bg-amber-400 border-amber-400 text-white"
            : "bg-white border-slate-200 text-slate-300 hover:border-amber-300 hover:text-amber-400"
        }`}
      >
        {saved ? "★" : "☆"}
      </button>

      <div className="px-4 pt-4 pb-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-8">
          <CategoryBadge category={event.category} />
          {event.featured && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {dayLabel && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isUrgent ? "text-red-700 bg-red-50 border-red-200" : "text-slate-500 bg-slate-50 border-slate-200"
            }`}>
              {dayLabel}
            </span>
          )}
        </div>

        {/* Title + date */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-snug flex-1">{event.name}</h3>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-slate-700">{fmt(event.date)}</div>
            {event.endDate && event.endDate !== event.date && (
              <div className="text-[10px] text-slate-400">–{fmt(event.endDate)}</div>
            )}
            <div className="text-[10px] text-slate-400">{event.time}</div>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-start gap-1 mb-2">
          <span className="text-slate-400 text-xs mt-0.5 shrink-0">📍</span>
          <div>
            <div className="text-xs font-medium text-slate-600">{event.venue}</div>
            <div className="text-[10px] text-slate-400">{event.area}</div>
          </div>
        </div>

        {/* Format + attendees */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${
            event.format === "in-person"
              ? "bg-green-50 text-green-700 border-green-200"
              : event.format === "hybrid"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-purple-50 text-purple-700 border-purple-200"
          }`}>
            {event.format === "in-person" ? "In-Person" : event.format === "hybrid" ? "Hybrid" : "Online"}
          </span>
          {event.expectedAttendees && (
            <span className="text-[10px] text-slate-400">{event.expectedAttendees}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{event.description}</p>

        {/* Countdown — only when close */}
        {showCountdown && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold">Countdown:</span>
            <Countdown date={event.date} compact />
          </div>
        )}

        {/* Tier price pills */}
        {event.ticket.tiers && event.ticket.tiers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {event.ticket.tiers.slice(0, 3).map((tier, i) => {
              const ts = TICKET_STATUS_META[tier.status];
              return (
                <span key={i} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${ts.bg} ${ts.color} ${ts.border} ${tier.status === "sold-out" ? "line-through opacity-50" : ""}`}>
                  {tier.name}: {tier.price}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint to expand */}
      <div className="px-4 pb-2">
        <span className="text-[10px] font-semibold text-indigo-500 group-hover:text-indigo-700 transition-colors">
          Click for full details, booking steps & more →
        </span>
      </div>

      {/* Ticket footer */}
      <div className={`mt-auto px-4 py-2.5 border-t ${meta.bg} flex items-center justify-between gap-2`}>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shrink-0`} />
            <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
          </div>
          <div className="text-xs font-bold text-slate-800">{event.ticket.price ?? "N/A"}</div>
          {event.ticket.platform && (
            <div className="text-[10px] text-slate-400">via {event.ticket.platform}</div>
          )}
        </div>

        {/* Ticket button — always shows, always goes somewhere real */}
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
            bookable && !deadlinePassed
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-slate-200 hover:bg-slate-300 text-slate-600"
          }`}
        >
          {bookable && !deadlinePassed ? "Get Tickets" : "Search Online"}
        </a>
      </div>
    </div>
  );
}
