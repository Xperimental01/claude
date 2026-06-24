"use client";
import { useState, useMemo } from "react";
import { Event, CATEGORY_META } from "@/types/event";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  parseISO,
} from "date-fns";

export default function CalendarView({
  events,
  onOpenDetail,
}: {
  events: Event[];
  onOpenDetail: (e: Event) => void;
}) {
  const firstEventDate = events.length
    ? parseISO([...events].sort((a, b) => a.date.localeCompare(b.date))[0].date)
    : new Date();
  const [cursor, setCursor] = useState(startOfMonth(firstEventDate));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Prev
        </button>
        <h3 className="text-base font-black text-slate-800">{format(cursor, "MMMM yyyy")}</h3>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={key}
              className={`min-h-[84px] rounded-lg border p-1.5 ${
                inMonth ? "bg-white border-slate-100" : "bg-slate-50/50 border-transparent"
              }`}
            >
              <div
                className={`text-[11px] font-bold mb-1 ${
                  isToday
                    ? "text-white bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center"
                    : inMonth
                    ? "text-slate-600"
                    : "text-slate-300"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => {
                  const meta = CATEGORY_META[e.category];
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpenDetail(e)}
                      className={`w-full text-left text-[9px] leading-tight px-1 py-0.5 rounded truncate ${meta.bg} ${meta.color} hover:opacity-80`}
                      title={e.name}
                    >
                      {meta.icon} {e.name}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-400 px-1">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
