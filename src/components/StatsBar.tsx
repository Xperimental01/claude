"use client";
import { Event, CATEGORY_META, EventCategory } from "@/types/event";

export default function StatsBar({ events }: { events: Event[] }) {
  const categoryCounts = Object.keys(CATEGORY_META).map((cat) => ({
    category: cat as EventCategory,
    count: events.filter((e) => e.category === cat).length,
  })).filter((c) => c.count > 0);

  const freeCount = events.filter((e) => e.ticket.price?.toLowerCase().includes("free")).length;
  const featuredCount = events.filter((e) => e.featured).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="text-2xl font-black text-indigo-600">{events.length}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Events</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="text-2xl font-black text-emerald-600">{freeCount}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">Free to Attend</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="text-2xl font-black text-amber-600">{featuredCount}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">Featured Events</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="text-2xl font-black text-slate-700">{categoryCounts.length}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">Categories</div>
      </div>
    </div>
  );
}
