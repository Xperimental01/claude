"use client";
import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import CategoryBadge from "./CategoryBadge";
import { format, parseISO } from "date-fns";

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "EEEE, dd MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export default function EventModal({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const meta = CATEGORY_META[event.category];
  const statusMeta = TICKET_STATUS_META[event.ticket.status];
  const isBookable =
    event.ticket.status !== "sold-out" &&
    event.ticket.status !== "closed";

  const deadlinePassed = event.ticket.registrationDeadline
    ? new Date(event.ticket.registrationDeadline) < new Date()
    : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${meta.bg}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors text-lg"
          >
            ✕
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={event.category} />
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">{event.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span>📅 {formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}</span>
            <span>🕐 {event.time}</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            📍 {event.venue}, {event.address}, {event.area}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">About This Event</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Highlights */}
          {event.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What To Expect</h3>
              <ul className="space-y-1.5">
                {event.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-500 mt-0.5">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Event details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 font-semibold">Organiser</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{event.organizer}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 font-semibold">Format</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{event.format}</div>
            </div>
            {event.expectedAttendees && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-semibold">Expected Attendees</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">{event.expectedAttendees}</div>
              </div>
            )}
            {event.ticket.registrationDeadline && (
              <div className={`rounded-lg p-3 border ${deadlinePassed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-100"}`}>
                <div className="text-xs text-slate-500 font-semibold">Registration Deadline</div>
                <div className={`text-sm font-bold mt-0.5 ${deadlinePassed ? "text-red-600" : "text-green-700"}`}>
                  {formatDate(event.ticket.registrationDeadline)}
                  {deadlinePassed && " (Passed)"}
                </div>
              </div>
            )}
          </div>

          {/* Ticket tiers */}
          {event.ticket.tiers && event.ticket.tiers.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Ticket Options</h3>
              <div className="space-y-2">
                {event.ticket.tiers.map((tier, i) => {
                  const tierStatus = TICKET_STATUS_META[tier.status];
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border p-3 flex items-start justify-between gap-3 ${
                        tier.status === "sold-out" ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{tier.name}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${tierStatus.bg} ${tierStatus.color} ${tierStatus.border}`}
                          >
                            {tierStatus.label}
                          </span>
                        </div>
                        {tier.perks && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tier.perks.map((p, j) => (
                              <span key={j} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-black ${tier.status === "sold-out" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {tier.price}
                        </div>
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
              <div className="space-y-2">
                {event.ticket.bookingSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

        {/* Sticky booking footer */}
        <div className={`sticky bottom-0 p-4 border-t flex items-center justify-between gap-3 ${meta.bg} rounded-b-2xl`}>
          <div>
            <div className="text-sm font-black text-slate-800">{event.ticket.price ?? "N/A"}</div>
            {event.ticket.platform && (
              <div className="text-xs text-slate-500">via {event.ticket.platform}</div>
            )}
          </div>
          {isBookable && !deadlinePassed && event.ticket.link ? (
            <a
              href={event.ticket.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Book Now →
            </a>
          ) : (
            <div className="text-right">
              <span className={`text-sm font-bold ${statusMeta.color}`}>{statusMeta.label}</span>
              {deadlinePassed && <div className="text-[10px] text-slate-500">Registration deadline has passed</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
