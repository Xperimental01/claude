"use client";
import { useState, useEffect, useMemo } from "react";
import { Event } from "@/types/event";
import { ALL_EVENTS, getUpcomingEvents, searchEvents } from "@/lib/events-data";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import FilterBar from "./FilterBar";
import StatsBar from "./StatsBar";
import InsightsPanel from "./InsightsPanel";
import CalendarView from "./CalendarView";
import Countdown from "./Countdown";
import ChatAssistant from "./ChatAssistant";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { format } from "date-fns";

type ViewMode = "grid" | "timeline" | "calendar" | "insights";

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
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [freeOnly, setFreeOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const { saved, isSaved, count: savedCount } = useSavedEvents();

  useEffect(() => { setLastRefresh(new Date()); }, []);

  const allUpcoming = useMemo(() => getUpcomingEvents(ALL_EVENTS), []);

  // Featured event for hero countdown — the soonest featured event
  const heroEvent = useMemo(
    () => allUpcoming.find((e) => e.featured) ?? null,
    [allUpcoming]
  );

  const filteredEvents = useMemo(() => {
    let events = [...allUpcoming];

    if (savedOnly) events = events.filter((e) => isSaved(e.id));
    if (searchQuery) events = searchEvents(searchQuery, events);
    if (selectedCategory !== "all") events = events.filter((e) => e.category === selectedCategory);
    if (selectedArea !== "All Areas") events = events.filter((e) => e.area === selectedArea);
    if (selectedFormat !== "All Formats") events = events.filter((e) => e.format === selectedFormat);
    if (freeOnly) events = events.filter(
      (e) => e.ticket.status === "free" || e.ticket.price?.toLowerCase().includes("free")
    );

    if (sortBy === "date-desc") events = [...events].reverse();
    else if (sortBy === "name") events = [...events].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "price-asc") events = [...events].sort((a, b) => parseMinPrice(a.ticket.price) - parseMinPrice(b.ticket.price));

    return events;
  }, [allUpcoming, savedOnly, searchQuery, selectedCategory, selectedArea, selectedFormat, freeOnly, sortBy, saved, isSaved]);

  const grouped = useMemo(() => groupByMonth(filteredEvents), [filteredEvents]);

  const activeFilters =
    selectedCategory !== "all" || selectedArea !== "All Areas" ||
    searchQuery || selectedFormat !== "All Formats" || freeOnly || savedOnly;

  const clearAll = () => {
    setSelectedCategory("all"); setSelectedArea("All Areas");
    setSelectedFormat("All Formats"); setSearchQuery("");
    setFreeOnly(false); setSavedOnly(false);
  };

  const views: Array<{ id: ViewMode; label: string; icon: string }> = [
    { id: "grid", label: "Grid", icon: "⊞" },
    { id: "timeline", label: "Timeline", icon: "☰" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "insights", label: "Insights", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow">
                D
              </div>
              <div>
                <h1 className="font-black text-slate-900 text-base leading-none">Delhi NCR Events</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[10px] text-slate-500">Live · Updated {format(lastRefresh, "dd MMM, hh:mm a")}</p>
                </div>
              </div>
            </div>

            {/* View switcher */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              {views.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 ${
                    viewMode === v.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="hidden sm:inline">{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-6 mb-8 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 text-[120px] leading-none select-none">🗓</div>
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">Delhi & NCR Event Tracker</h2>
              <p className="text-indigo-200 text-sm mt-1 max-w-lg">
                {filteredEvents.length} upcoming events · Curated across Tech, Finance, Consulting, Entertainment & more.
                Click any card for full details, ticket tiers, and a step-by-step booking guide.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["New Delhi", "Gurugram", "Noida", "Faridabad"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedArea(city)}
                    className="text-xs bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full font-medium transition-colors"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero countdown */}
            {heroEvent && (
              <div className="shrink-0 text-right">
                <div className="text-indigo-200 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Next featured event
                </div>
                <div className="text-white text-xs font-bold mb-2 line-clamp-1">{heroEvent.name}</div>
                <Countdown date={heroEvent.date} />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <StatsBar events={filteredEvents} savedCount={savedCount} />

        {/* Filters */}
        <FilterBar
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          selectedArea={selectedArea} setSelectedArea={setSelectedArea}
          selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          sortBy={sortBy} setSortBy={setSortBy}
          freeOnly={freeOnly} setFreeOnly={setFreeOnly}
          savedOnly={savedOnly} setSavedOnly={setSavedOnly}
          savedCount={savedCount}
        />

        {/* Results row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredEvents.length}</span> events
            {selectedCategory !== "all" && ` · ${selectedCategory.replace("-", " & ")}`}
            {selectedArea !== "All Areas" && ` · ${selectedArea}`}
            {freeOnly && " · Free only"}
            {savedOnly && " · Saved"}
          </p>
          <div className="flex items-center gap-2">
            {activeFilters && (
              <button onClick={clearAll}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1 rounded-full transition-colors">
                Clear all ✕
              </button>
            )}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                showInsights ? "bg-indigo-600 text-white border-indigo-600" : "text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {showInsights ? "Hide" : "Show"} Insights
            </button>
          </div>
        </div>

        {/* Insights panel (togglable, also shown in Insights view) */}
        {(showInsights || viewMode === "insights") && (
          <InsightsPanel events={filteredEvents} />
        )}

        {/* Main content */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗓</div>
            <div className="text-lg font-semibold text-slate-600">No events found</div>
            <div className="text-sm text-slate-400 mt-1">Try adjusting your filters</div>
            {activeFilters && (
              <button onClick={clearAll} className="mt-4 text-sm font-semibold text-indigo-600 underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView events={filteredEvents} onOpenDetail={setSelectedEvent} />
        ) : viewMode === "insights" ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Full insights shown above ↑ — switch to Grid or Timeline to browse events
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onOpenDetail={setSelectedEvent} />
            ))}
          </div>
        ) : (
          /* Timeline */
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, events]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {month}
                  </h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} onOpenDetail={setSelectedEvent} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-500">Delhi NCR Events Tracker</div>
          <div>Events sourced from BookMyShow, Paytm Insider, Eventbrite, GDG, NASSCOM & official organisers · Refreshed daily</div>
          <div>Last loaded: {format(lastRefresh, "EEEE, dd MMMM yyyy 'at' hh:mm a")}</div>
        </footer>
      </main>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* AI Chat Assistant */}
      <ChatAssistant events={allUpcoming} onSelectEvent={setSelectedEvent} />
    </div>
  );
}
