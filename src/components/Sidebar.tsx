"use client";
import Link from "next/link";
import { CATEGORY_META, CATEGORY_GROUPS, categoriesInGroup } from "@/types/event";

export type ViewMode = "discover" | "trending" | "calendar" | "insights" | "saved";

export interface SidebarProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categoryCounts: Record<string, number>;
  savedCount: number;
  liveCount: number;
  sampleCount: number;
  open: boolean;
  onClose: () => void;
}

const NAV: Array<{ id: ViewMode; label: string; icon: string; hint: string }> = [
  { id: "discover", label: "Discover", icon: "🧭", hint: "Browse every tracked event" },
  { id: "trending", label: "Trending", icon: "🔥", hint: "Hot topics and scarce tickets" },
  { id: "calendar", label: "Calendar", icon: "📅", hint: "Month grid view" },
  { id: "insights", label: "Insights", icon: "📊", hint: "Breakdowns and charts" },
  { id: "saved", label: "My Events", icon: "★", hint: "Your bookmarked events" },
];

export default function Sidebar({
  view,
  setView,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  savedCount,
  liveCount,
  sampleCount,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3">
          <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Views
          </p>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = view === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setView(item.id);
                      onClose();
                    }}
                    title={item.hint}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.id === "saved" && savedCount > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {savedCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="px-2 pb-2 pt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Categories
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>🗓</span>
                <span className="flex-1">All events</span>
              </button>
            </li>
          </ul>

          {/* Grouped, and groups with nothing in them are hidden: 28 flat rows
              would bury the categories that actually have events. */}
          {CATEGORY_GROUPS.map((group) => {
            const cats = categoriesInGroup(group).filter((c) => (categoryCounts[c] ?? 0) > 0);
            if (cats.length === 0) return null;
            return (
              <div key={group} className="mt-3">
                <p className="px-2 pb-1 text-[9px] font-black uppercase tracking-wider text-slate-300">
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {cats.map((key) => {
                    const meta = CATEGORY_META[key];
                    const count = categoryCounts[key] ?? 0;
                    const active = selectedCategory === key;
                    return (
                      <li key={key}>
                        <button
                          onClick={() => setSelectedCategory(key)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                            active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>{meta.icon}</span>
                          <span className="flex-1 truncate">{meta.label}</span>
                          <span className={active ? "text-white/70" : "text-slate-400"}>{count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {/* Data provenance summary — always visible, never buried. */}
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Data sources
            </p>
            <dl className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Live listings
                </dt>
                <dd className="text-[11px] font-black text-slate-700">{liveCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Sample data
                </dt>
                <dd className="text-[11px] font-black text-slate-700">{sampleCount}</dd>
              </div>
            </dl>
            {liveCount === 0 && (
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                No live feed connected — events shown are samples.
              </p>
            )}
            <Link
              href="/requirements"
              className="mt-2 block rounded-md bg-indigo-600 px-2 py-1.5 text-center text-[10px] font-bold text-white transition-colors hover:bg-indigo-700"
            >
              What I need from you →
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
