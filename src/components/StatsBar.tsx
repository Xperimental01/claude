"use client";
import { Event } from "@/types/event";

export default function StatsBar({ events, savedCount }: { events: Event[]; savedCount: number }) {
  const freeCount = events.filter(
    (e) => e.ticket.status === "free" || e.ticket.price?.toLowerCase().includes("free")
  ).length;
  const availableCount = events.filter(
    (e) => e.ticket.status === "available" || e.ticket.status === "selling-fast" || e.ticket.status === "few-left" || e.ticket.status === "free"
  ).length;
  const featuredCount = events.filter((e) => e.featured).length;

  const stats = [
    { value: events.length, label: "Total Events", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { value: availableCount, label: "Tickets Available", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { value: freeCount, label: "Free to Attend", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { value: featuredCount, label: "Featured", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { value: savedCount, label: "Saved by You", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-xl border ${s.border} p-3 shadow-sm`}>
          <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
