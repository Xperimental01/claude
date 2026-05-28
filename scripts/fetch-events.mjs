/**
 * Fetches upcoming events in Delhi NCR from the Ticketmaster Discovery API
 * and writes them to src/data/fetched-events.json.
 *
 * Run: node scripts/fetch-events.mjs
 * Requires env var: TICKETMASTER_API_KEY
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "../src/data/fetched-events.json");

const API_KEY = process.env.TICKETMASTER_API_KEY;

if (!API_KEY) {
  console.warn("TICKETMASTER_API_KEY not set — skipping fetch, keeping existing data.");
  process.exit(0);
}

function detectCategory(event) {
  const segment = event.classifications?.[0]?.segment?.name?.toLowerCase() ?? "";
  const genre = event.classifications?.[0]?.genre?.name?.toLowerCase() ?? "";
  const name = event.name?.toLowerCase() ?? "";

  if (segment === "music") return "entertainment";
  if (["ai", "tech", "cloud", "data", "software", "machine learning", "blockchain", "startup"].some(k => name.includes(k))) return "tech-ai";
  if (["finance", "investment", "banking", "fintech", "stock", "trading"].some(k => name.includes(k))) return "finance";
  if (["consulting", "strategy", "case", "mba", "management"].some(k => name.includes(k))) return "consulting";
  if (["conference", "summit", "expo", "seminar", "workshop", "ted"].some(k => name.includes(k))) return "knowledge";
  if (["networking", "meetup", "mixer"].some(k => name.includes(k))) return "networking";
  if (segment === "arts & theatre" || genre === "theatre") return "knowledge";
  return "other";
}

function mapEvent(raw) {
  const venue = raw._embedded?.venues?.[0];
  const priceRange = raw.priceRanges?.[0];
  const date = raw.dates?.start?.localDate ?? "";
  const time = raw.dates?.start?.localTime
    ? new Date(`2000-01-01T${raw.dates.start.localTime}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "TBA";

  const priceStr = priceRange
    ? priceRange.min === priceRange.max
      ? `₹${Math.round(priceRange.min)}`
      : `₹${Math.round(priceRange.min)} – ₹${Math.round(priceRange.max)}`
    : "Check website";

  return {
    id: `tm-${raw.id}`,
    name: raw.name,
    category: detectCategory(raw),
    date,
    time,
    venue: venue?.name ?? "Venue TBA",
    address: venue?.address?.line1 ?? "",
    area: venue?.city?.name ?? "Delhi NCR",
    description: raw.info ?? raw.pleaseNote ?? raw.name,
    highlights: [],
    organizer: raw.promoter?.name ?? "Ticketmaster",
    format: "in-person",
    ticket: {
      available: true,
      price: priceStr,
      link: raw.url,
      platform: "Ticketmaster",
    },
    tags: [
      raw.classifications?.[0]?.segment?.name,
      raw.classifications?.[0]?.genre?.name,
    ].filter(Boolean),
    sourceUrl: raw.url,
  };
}

async function fetchEvents() {
  const cities = ["Delhi", "Gurugram", "Noida", "Gurgaon"];
  const seen = new Set();
  const events = [];

  for (const city of cities) {
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", API_KEY);
    url.searchParams.set("city", city);
    url.searchParams.set("countryCode", "IN");
    url.searchParams.set("size", "50");
    url.searchParams.set("sort", "date,asc");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(`Ticketmaster API error for ${city}: ${res.status}`);
        continue;
      }
      const json = await res.json();
      const rawEvents = json._embedded?.events ?? [];

      for (const raw of rawEvents) {
        if (!seen.has(raw.id)) {
          seen.add(raw.id);
          events.push(mapEvent(raw));
        }
      }
      console.log(`Fetched ${rawEvents.length} events for ${city}`);
    } catch (err) {
      console.warn(`Failed to fetch for ${city}:`, err.message);
    }
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  writeFileSync(OUT_FILE, JSON.stringify(events, null, 2));
  console.log(`\nWrote ${events.length} total events to ${OUT_FILE}`);
}

fetchEvents();
