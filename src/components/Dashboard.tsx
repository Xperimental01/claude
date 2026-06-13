"use client";
import { useState, useEffect, useMemo } from "react";
import { Event } from "@/types/event";
import { ALL_EVENTS, getUpcomingEvents, searchEvents } from "@/lib/events-data";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import FilterBar from "./FilterBar";
import StatsBar from "./StatsBar";
import ChatAssistant from "./ChatAssistant";
import { format } from "date-fns";

function groupByMonth(events: Event[]): Record<string, Event[]> {
  const groups: Record<string, Event[]> = {};
  for (const e of events) {
    const monthKey = format(new Date(e.date), "MMMM yyyy");
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(e);
  }
  return groups;
}

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    setLastRefresh(new Date());
  }, []);

  const allUpcoming = useMemo(() => getUpcomingEvents(ALL_EVENTS), []);

  const filteredEvents = useMemo(() => {
    let events = [...allUpcoming];

    if (searchQuery) events = searchEvents(searchQuery, events);
    if (selectedCategory !== "all") events = events.filter((e) => e.category === selectedCategory);
    if (selectedArea !== "All Areas") events = events.filter((e) => e.area === selectedArea);
    if (selectedFormat !== "All Formats") events = events.filter((e) => e.format === selectedFormat);

    if (sortBy === "date-desc") events = [...events].reverse();
    if (sortBy === "name") events = [...events].sort((a, b) => a.name.localeCompare(b.name));

    return events;
  }, [allUpcoming, searchQuery, selectedCategory, selectedArea, selectedFormat, sortBy]);

  const grouped = useMemo(() => groupByMonth(filteredEvents), [filteredEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow">
                D
              </div>
              <div>
                <h1 className="font-black text-slate-900 text-lg leading-none">Delhi NCR Events</h1>
                <p className="text-xs text-slate-500 leading-none mt-0.5">Live Event Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Updated {format(lastRefresh, "dd MMM, hh:mm a")}
              </div>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "timeline" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Timeline
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero strip */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Delhi & NCR Event Tracker</h2>
              <p className="text-indigo-200 text-sm mt-1">
                Curated events across Tech, Finance, Consulting, Entertainment & more — updated daily
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["New Delhi", "Gurugram", "Noida", "Faridabad"].map((city) => (
                  <span key={city} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                    {city}
                  </span>
                ))}
              </div>
              <p className="text-indigo-200 text-xs mt-3">
                Click any event card for full details, ticket tiers, and step-by-step booking guide.
                Use the AI assistant (bottom-right) for help finding events and buying tickets.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-white">{filteredEvents.length}</div>
              <div className="text-indigo-200 text-sm">Upcoming Events</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsBar events={filteredEvents} />

        {/* Filters */}
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
        />

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredEvents.length}</span> events
            {selectedCategory !== "all" && ` in ${selectedCategory.replace("-", " & ")}`}
            {selectedArea !== "All Areas" && ` · ${selectedArea}`}
          </p>
          {(selectedCategory !== "all" || selectedArea !== "All Areas" || searchQuery || selectedFormat !== "All Formats") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedArea("All Areas");
                setSelectedFormat("All Formats");
                setSearchQuery("");
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">🗓</div>
            <div className="text-lg font-semibold text-slate-600">No events found</div>
            <div className="text-sm mt-1">Try adjusting your filters or search query</div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onOpenDetail={setSelectedEvent} />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, events]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
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

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-500">Delhi NCR Events Tracker</div>
          <div>Events are curated from Eventbrite, BookMyShow, Paytm Insider, GDG, NASSCOM & official organiser websites.</div>
          <div className="mt-2">Last refreshed: {format(lastRefresh, "EEEE, dd MMMM yyyy 'at' hh:mm a")}</div>
        </footer>
      </main>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* AI Chat Assistant */}
      <ChatAssistant events={allUpcoming} onSelectEvent={(e) => setSelectedEvent(e)} />
    </div>
  );
}
