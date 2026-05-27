"use client";
import { EventCategory, CATEGORY_META } from "@/types/event";

const AREAS = ["All Areas", "New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"];
const FORMATS = ["All Formats", "in-person", "hybrid", "online"];

interface FilterBarProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedArea: string;
  setSelectedArea: (a: string) => void;
  selectedFormat: string;
  setSelectedFormat: (f: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

export default function FilterBar({
  selectedCategory,
  setSelectedCategory,
  selectedArea,
  setSelectedArea,
  selectedFormat,
  setSelectedFormat,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: FilterBarProps) {
  const categories: Array<{ key: string; label: string; icon: string }> = [
    { key: "all", label: "All Events", icon: "🗓" },
    ...Object.entries(CATEGORY_META).map(([key, meta]) => ({
      key,
      label: meta.label,
      icon: meta.icon,
    })),
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search events by name, venue, tag, or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-slate-50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedCategory === cat.key
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Area:</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Format:</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f === "in-person" ? "In-Person" : f === "all" ? "All Formats" : f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          >
            <option value="date-asc">Date (Earliest first)</option>
            <option value="date-desc">Date (Latest first)</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
