"use client";
import { useMemo } from "react";
import { Event, CATEGORY_META, EventCategory } from "@/types/event";
import { format, parseISO } from "date-fns";

function parsePrice(price?: string): number | null {
  if (!price) return null;
  if (price.toLowerCase().includes("free")) return 0;
  const matches = price.replace(/,/g, "").match(/\d+/g);
  if (!matches) return null;
  return Math.min(...matches.map(Number));
}

export default function InsightsPanel({ events }: { events: Event[] }) {
  const stats = useMemo(() => {
    const byCategory = new Map<EventCategory, number>();
    const byArea = new Map<string, number>();
    const byMonth = new Map<string, number>();
    let free = 0;
    let paid = 0;
    let cheapest: { price: number; name: string } | null = null;

    for (const e of events) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + 1);
      byArea.set(e.area, (byArea.get(e.area) ?? 0) + 1);
      const month = format(parseISO(e.date), "MMM yyyy");
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);

      const p = parsePrice(e.ticket.price);
      if (p === 0) free++;
      else if (p && p > 0) {
        paid++;
        if (!cheapest || p < cheapest.price) cheapest = { price: p, name: e.name };
      }
    }

    const maxCat = Math.max(1, ...byCategory.values());
    const maxArea = Math.max(1, ...byArea.values());
    const maxMonth = Math.max(1, ...byMonth.values());

    return {
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      areas: [...byArea.entries()].sort((a, b) => b[1] - a[1]),
      months: [...byMonth.entries()].sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
      ),
      free,
      paid,
      cheapest,
      maxCat,
      maxArea,
      maxMonth,
    };
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
        📊 Event Insights
        <span className="text-xs font-normal text-slate-400">
          ({events.length} events analysed)
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* By category */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            By Category
          </div>
          <div className="space-y-2">
            {stats.categories.map(([cat, count]) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-xs w-24 shrink-0 text-slate-600 truncate">
                    {meta.icon} {meta.label}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(count / stats.maxCat) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By area */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            By Area
          </div>
          <div className="space-y-2">
            {stats.areas.slice(0, 6).map(([area, count]) => (
              <div key={area} className="flex items-center gap-2">
                <span className="text-xs w-24 shrink-0 text-slate-600 truncate">📍 {area}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(count / stats.maxArea) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By month + pricing */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Timeline & Pricing
          </div>
          <div className="space-y-2 mb-4">
            {stats.months.map(([month, count]) => (
              <div key={month} className="flex items-center gap-2">
                <span className="text-xs w-20 shrink-0 text-slate-600 truncate">{month}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(count / stats.maxMonth) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
              <div className="text-lg font-black text-emerald-600">{stats.free}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Free</div>
            </div>
            <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-center">
              <div className="text-lg font-black text-indigo-600">{stats.paid}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Paid</div>
            </div>
          </div>
          {stats.cheapest && (
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              Cheapest paid: ₹{stats.cheapest.price} · {stats.cheapest.name.slice(0, 24)}
              {stats.cheapest.name.length > 24 ? "…" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
