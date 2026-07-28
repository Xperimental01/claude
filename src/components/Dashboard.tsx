"use client";
import { useState, useMemo } from "react";
import { Event } from "@/types/event";
import {
  ALL_EVENTS,
  LIVE_EVENT_COUNT,
  getUpcomingEvents,
  searchEvents,
} from "@/lib/events-data";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import FilterBar from "./FilterBar";
import StatsBar from "./StatsBar";
import InsightsPanel from "./InsightsPanel";
import CalendarView from "./CalendarView";
import TrendingPanel from "./TrendingPanel";
import Sidebar, { ViewMode } from "./Sidebar";
import Countdown from "./Countdown";
import ChatAssistant from "./ChatAssistant";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import buildInfo from "@/data/build-info.json";
import { format, parseISO } from "date-fns";

/**
 * When the data was last rebuilt. This is what a user actually wants to know —
 * page-load time says nothing about data freshness. Being a build-time constant
 * it also renders identically on the server and after hydration.
 */
const BUILT_AT = parseISO(buildInfo.builtAt);

function groupByMonth(events: Event[]): Record<string, Event[]> {
  const groups: Record<string, Event[]> = {};
  for (const e of events) {
    const k = format(new Date(e.date), "MMMM yyyy");
    if (!groups[k]) groups[k] = [];
    groups[k].push(e);
  }
  return groups;
}

function parseMinPrice(price?: string): number {
  if (!price) return Infinity;
  if (price.toLowerCase().includes("free")) return 0;
  const nums = price.replace(/,/g, "").match(/\d+/g);
  return nums ? Math.min(...nums.map(Number)) : Infinity;
}

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>("discover");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const { isSaved, count: savedCount } = useSavedEvents();

  const allUpcoming = useMemo(() => getUpcomingEvents(ALL_EVENTS), []);
  const liveCount = useMemo(
    () => allUpcoming.filter((e) => e.sourceType === "live-api").length,
    [allUpcoming],
  );
  const sampleCount = allUpcoming.length - liveCount;

  const heroEvent = useMemo(
    () => allUpcoming.find((e) => e.featured) ?? allUpcoming[0] ?? null,
    [allUpcoming],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of allUpcoming) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, [allUpcoming]);

  const filteredEvents = useMemo(() => {
    let events = [...allUpcoming];

    if (view === "saved") events = events.filter((e) => isSaved(e.id));
    if (searchQuery) events = searchEvents(searchQuery, events);
    if (selectedCategory !== "all") events = events.filter((e) => e.category === selectedCategory);
    if (selectedArea !== "All Areas") events = events.filter((e) => e.area === selectedArea);
    if (selectedFormat !== "All Formats") events = events.filter((e) => e.format === selectedFormat);
    if (freeOnly) {
      events = events.filter(
        (e) => e.ticket.status === "free" || e.ticket.price?.toLowerCase().includes("free"),
      );
    }

    if (sortBy === "date-desc") events = [...events].reverse();
    else if (sortBy === "name") events = [...events].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "price-asc") {
      events = [...events].sort(
        (a, b) => parseMinPrice(a.ticket.price) - parseMinPrice(b.ticket.price),
      );
    }

    return events;
  }, [
    allUpcoming, view, searchQuery, selectedCategory, selectedArea,
    selectedFormat, freeOnly, sortBy, isSaved,
  ]);

  const grouped = useMemo(() => groupByMonth(filteredEvents), [filteredEvents]);

  const activeFilters =
    selectedCategory !== "all" ||
    selectedArea !== "All Areas" ||
    selectedFormat !== "All Formats" ||
    !!searchQuery ||
    freeOnly;

  const clearAll = () => {
    setSelectedCategory("all");
    setSelectedArea("All Areas");
    setSelectedFormat("All Formats");
    setSearchQuery("");
    setFreeOnly(false);
  };

  const eventGrid = (events: Event[]) => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onOpenDetail={setSelectedEvent} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-600 lg:hidden"
            >
              ☰
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-base font-black text-white shadow">
              D
            </div>
            <div>
              <h1 className="text-base font-black leading-none text-slate-900">Delhi NCR Events</h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <p className="text-[10px] text-slate-500">
                  Data updated {format(BUILT_AT, "dd MMM, hh:mm a")}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
              {liveCount} live
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              {sampleCount} sample
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar
          view={view}
          setView={setView}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          savedCount={savedCount}
          liveCount={liveCount}
          sampleCount={sampleCount}
          open={navOpen}
          onClose={() => setNavOpen(false)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {/* Data provenance notice — the most important thing on the page. */}
          {LIVE_EVENT_COUNT === 0 && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-sm font-black text-amber-900">
                ⚠ Showing sample data, not live listings
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                No ticketing API is connected, so every event below is illustrative placeholder
                content. These events are <strong>not confirmed to exist</strong>, and their
                booking buttons run a web search rather than opening a purchase page. To show real
                listings, add a <code className="rounded bg-amber-100 px-1">TICKETMASTER_API_KEY</code>{" "}
                secret in your repository&apos;s GitHub Actions settings.
              </p>
            </div>
          )}

          {/* Hero */}
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 p-6 shadow-lg">
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-2xl font-black text-white">Delhi &amp; NCR Event Tracker</h2>
                <p className="mt-1 max-w-lg text-sm text-indigo-200">
                  {filteredEvents.length} upcoming events across Tech, Finance, Consulting,
                  Entertainment and more. Open any card for ticket tiers and every route to a
                  working booking page.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["New Delhi", "Gurugram", "Noida", "Faridabad"].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedArea(city)}
                      className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
                    >
                      📍 {city}
                    </button>
                  ))}
                </div>
              </div>

              {heroEvent && (
                <div className="shrink-0 text-right">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                    Next up
                  </div>
                  <div className="mb-2 line-clamp-1 text-xs font-bold text-white">
                    {heroEvent.name}
                  </div>
                  <Countdown date={heroEvent.date} />
                </div>
              )}
            </div>
          </div>

          <StatsBar events={filteredEvents} savedCount={savedCount} />

          {view === "trending" ? (
            <TrendingPanel
              events={allUpcoming}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                setView("discover");
              }}
              onOpenDetail={setSelectedEvent}
            />
          ) : view === "insights" ? (
            <InsightsPanel events={filteredEvents} />
          ) : (
            <>
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedArea={selectedArea}
                setSelectedArea={setSelectedArea}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                freeOnly={freeOnly}
                setFreeOnly={setFreeOnly}
                savedOnly={view === "saved"}
                setSavedOnly={(v) => setView(v ? "saved" : "discover")}
                savedCount={savedCount}
              />

              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-bold text-slate-800">{filteredEvents.length}</span>{" "}
                  events
                  {view === "saved" && " · saved"}
                  {selectedArea !== "All Areas" && ` · ${selectedArea}`}
                  {freeOnly && " · free only"}
                </p>
                {activeFilters && (
                  <button
                    onClick={clearAll}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
                  >
                    Clear filters ✕
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mb-4 text-5xl">🗓</div>
                  <div className="text-lg font-semibold text-slate-600">
                    {view === "saved" ? "No saved events yet" : "No events found"}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {view === "saved"
                      ? "Tap the ☆ on any event card to save it here."
                      : "Try adjusting your filters."}
                  </div>
                  {activeFilters && (
                    <button
                      onClick={clearAll}
                      className="mt-4 text-sm font-semibold text-indigo-600 underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : view === "calendar" ? (
                <CalendarView events={filteredEvents} onOpenDetail={setSelectedEvent} />
              ) : (
                <div className="space-y-10">
                  {Object.entries(grouped).map(([month, events]) => (
                    <section key={month}>
                      <div className="mb-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <h3 className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm">
                          {month}
                        </h3>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      {eventGrid(events)}
                    </section>
                  ))}
                </div>
              )}
            </>
          )}

          <footer className="mt-16 space-y-1 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            <div className="font-semibold text-slate-500">Delhi NCR Events Tracker</div>
            <div>
              Live listings come from connected ticketing APIs. Sample entries are illustrative and
              unverified.
            </div>
            <div>
              Data last rebuilt {format(BUILT_AT, "EEEE, dd MMMM yyyy 'at' hh:mm a")} · refreshes
              hourly
            </div>
          </footer>
        </main>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <ChatAssistant events={allUpcoming} onSelectEvent={setSelectedEvent} />
    </div>
  );
}
