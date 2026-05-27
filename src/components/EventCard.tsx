"use client";
import { useState } from "react";
import { Event, CATEGORY_META } from "@/types/event";
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

export default function EventCard({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[event.category];
  const until = daysUntil(event.date);
  const isUrgent = until === "Today" || until === "Tomorrow";

  return (
    <div
      className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col ${event.featured ? "ring-2 ring-indigo-400" : ""}`}
    >
      {event.featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}

      <div className={`px-5 pt-5 pb-4 ${event.featured ? "pt-6" : ""}`}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <CategoryBadge category={event.category} />
              {event.featured && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  ⭐ Featured
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

        {/* Venue */}
        <div className="flex items-start gap-1.5 mb-3">
          <span className="text-slate-400 mt-0.5 shrink-0">📍</span>
          <div>
            <div className="text-sm font-medium text-slate-700">{event.venue}</div>
            <div className="text-xs text-slate-500">{event.address}, {event.area}</div>
          </div>
        </div>

        {/* Format + attendees */}
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
            {event.format === "in-person" ? "🏛 In-Person" : event.format === "hybrid" ? "🔀 Hybrid" : "💻 Online"}
          </span>
          {event.expectedAttendees && (
            <span className="text-xs text-slate-500">👥 {event.expectedAttendees}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.description}</p>
      </div>

      {/* Expandable section */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mx-5 mb-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 text-left transition-colors"
      >
        {expanded ? "▲ Show less" : "▼ View full details"}
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-4">
          {/* Highlights */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              What to expect
            </div>
            <ul className="space-y-1.5">
              {event.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Organizer */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Organiser
            </div>
            <div className="text-sm text-slate-700">{event.organizer}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ticket footer */}
      <div className={`mt-auto px-5 py-3 border-t flex items-center justify-between gap-3 ${meta.bg}`}>
        <div>
          <div className="text-xs text-slate-500 font-medium">Ticket</div>
          <div className="text-sm font-bold text-slate-800">{event.ticket.price ?? "N/A"}</div>
          {event.ticket.platform && (
            <div className="text-xs text-slate-500">via {event.ticket.platform}</div>
          )}
        </div>
        {event.ticket.available && event.ticket.link ? (
          <a
            href={event.ticket.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            Get Tickets →
          </a>
        ) : (
          <span className="text-xs font-semibold text-slate-400 italic">Not available</span>
        )}
      </div>
    </div>
  );
}
