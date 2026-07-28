"use client";
import { useMemo } from "react";
import { Event, CATEGORY_META } from "@/types/event";
import { differenceInDays, parseISO } from "date-fns";

/**
 * Surfaces what is actually gaining attention across the tracked events:
 * hot topics (tag frequency), scarcity signals (tickets running out), and
 * what is happening imminently.
 */
export default function TrendingPanel({
  events,
  onSelectTag,
  onOpenDetail,
}: {
  events: Event[];
  onSelectTag: (tag: string) => void;
  onOpenDetail: (e: Event) => void;
}) {
  const { topics, scarce, imminent } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      for (const tag of e.tags) {
        const key = tag.trim();
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const topics = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);

    const scarce = events
      .filter((e) => e.ticket.status === "few-left" || e.ticket.status === "selling-fast")
      .slice(0, 5);

    const today = new Date();
    const imminent = events
      .filter((e) => {
        const d = differenceInDays(parseISO(e.date), today);
        return d >= 0 && d <= 14;
      })
      .slice(0, 5);

    return { topics, scarce, imminent };
  }, [events]);

  const maxCount = topics.length ? topics[0][1] : 1;

  if (!events.length) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Hot topics */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
          🔥 Trending topics
        </h3>
        {topics.length === 0 ? (
          <p className="text-xs text-slate-400">No tags to rank yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {topics.map(([tag, count]) => {
              // Scale emphasis with frequency so the eye lands on what is hottest.
              const heat = count / maxCount;
              const strong = heat > 0.66;
              const mid = heat > 0.33;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    strong
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : mid
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tag} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Selling fast */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
          ⚡ Tickets running out
        </h3>
        {scarce.length === 0 ? (
          <p className="text-xs text-slate-400">Nothing flagged as scarce right now.</p>
        ) : (
          <ul className="space-y-1.5">
            {scarce.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => onOpenDetail(e)}
                  className="w-full rounded-lg border border-slate-100 p-2 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/50"
                >
                  <span className="block truncate text-xs font-bold text-slate-800">{e.name}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    {CATEGORY_META[e.category].icon} {e.area} · {e.ticket.price ?? "—"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Next 14 days */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
          ⏳ Happening in 14 days
        </h3>
        {imminent.length === 0 ? (
          <p className="text-xs text-slate-400">Nothing in the next two weeks.</p>
        ) : (
          <ul className="space-y-1.5">
            {imminent.map((e) => {
              const days = differenceInDays(parseISO(e.date), new Date());
              return (
                <li key={e.id}>
                  <button
                    onClick={() => onOpenDetail(e)}
                    className="flex w-full items-center gap-2 rounded-lg border border-slate-100 p-2 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <span className="shrink-0 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-black text-indigo-700">
                      {days <= 0 ? "TODAY" : `${days}d`}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-800">
                        {e.name}
                      </span>
                      <span className="block text-[10px] text-slate-500">{e.area}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
