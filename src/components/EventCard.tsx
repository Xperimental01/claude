"use client";
import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import CategoryBadge from "./CategoryBadge";
import { format, parseISO } from "date-fns";

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr);
  event.setHours(0, 0, 0, 0);
  const diff = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return "Past";
  return `In ${diff} days`;
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
  const until = daysUntil(event.date);
  const isUrgent = until === "Today" || until === "Tomorrow";
  const isSoldOut = event.ticket.status === "sold-out" || event.ticket.status === "closed";

  const deadlinePassed = event.ticket.registrationDeadline
    ? new Date(event.ticket.registrationDeadline) < new Date()
    : false;

  return (
    <div
      className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer ${
        event.featured ? "ring-2 ring-indigo-400" : ""
      } ${isSoldOut ? "opacity-75" : ""}`}
      onClick={() => onOpenDetail(event)}
    >
      {event.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}

      <div className={`px-5 pt-5 pb-4 ${event.featured ? "pt-6" : ""}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <CategoryBadge category={event.category} />
              {event.featured && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  isUrgent
                    ? "text-red-700 bg-red-50 border-red-200"
                    : "text-slate-600 bg-slate-50 border-slate-200"
                }`}
              >
                {until}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-snug">{event.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-slate-800">{formatDate(event.date)}</div>
            {event.endDate && event.endDate !== event.date && (
              <div className="text-xs text-slate-500">– {formatDate(event.endDate)}</div>
            )}
            <div className="text-xs text-slate-500 mt-0.5">{event.time}</div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 mb-3">
          <span className="text-slate-400 mt-0.5 shrink-0">📍</span>
          <div>
            <div className="text-sm font-medium text-slate-700">{event.venue}</div>
            <div className="text-xs text-slate-500">{event.address}, {event.area}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              event.format === "in-person"
                ? "bg-green-50 text-green-700 border-green-200"
                : event.format === "hybrid"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
            }`}
          >
            {event.format === "in-person" ? "In-Person" : event.format === "hybrid" ? "Hybrid" : "Online"}
          </span>
          {event.expectedAttendees && (
            <span className="text-xs text-slate-500">{event.expectedAttendees}</span>
          )}
        </div>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.description}</p>

        {/* Ticket tiers preview */}
        {event.ticket.tiers && event.ticket.tiers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {event.ticket.tiers.map((tier, i) => {
              const ts = TICKET_STATUS_META[tier.status];
              return (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${ts.bg} ${ts.color} ${ts.border} ${tier.status === "sold-out" ? "line-through opacity-60" : ""}`}
                >
                  {tier.name}: {tier.price}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* View details prompt */}
      <div className="mx-5 mb-3">
        <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          View full details & booking guide →
        </span>
      </div>

      {/* Ticket footer */}
      <div className={`mt-auto px-5 py-3 border-t flex items-center justify-between gap-3 ${meta.bg}`}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-bold ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-800">{event.ticket.price ?? "N/A"}</div>
          {event.ticket.platform && (
            <div className="text-xs text-slate-500">via {event.ticket.platform}</div>
          )}
        </div>
        {!isSoldOut && !deadlinePassed && event.ticket.link ? (
          <a
            href={event.ticket.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            Get Tickets →
          </a>
        ) : (
          <span className={`text-xs font-bold italic ${status.color}`}>
            {isSoldOut ? "Sold Out / Closed" : deadlinePassed ? "Deadline Passed" : "Not available"}
          </span>
        )}
      </div>
    </div>
  );
}
