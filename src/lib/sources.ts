import { EventCategory } from "@/types/event";

/**
 * How a source can actually be ingested. This is the honest part of the
 * aggregator: "pull events from every site" is not one problem, it is a dozen
 * problems with very different costs, and the UI should say which is which.
 */
export type IngestMethod =
  /** Documented public API. Needs a key, nothing else. Cheapest and most reliable. */
  | "public-api"
  /** API exists but requires an approved partner/affiliate account. */
  | "partner-api"
  /** Machine-readable feed (RSS/JSON/iCal) published for general use. */
  | "feed"
  /** No API. Requires rendering the page and parsing HTML — needs a real server. */
  | "scrape"
  /** No automated route at present; entries must be added by hand. */
  | "manual";

export type SourceStatus =
  /** Wired up and running in CI. */
  | "connected"
  /** Code path exists; blocked only on a credential. */
  | "needs-key"
  /** Needs an account/approval before a key can even be issued. */
  | "needs-account"
  /** Needs a scraping worker on a host that can run a browser. */
  | "needs-worker"
  /** Researched but not built. */
  | "planned";

export interface EventSource {
  id: string;
  name: string;
  /** Home page. Always an origin root — these do not 404. */
  url: string;
  /** What this source is good for. */
  blurb: string;
  method: IngestMethod;
  status: SourceStatus;
  /** Categories this source meaningfully covers. */
  covers: EventCategory[];
  /** Rough share of Delhi-NCR events this source would add. Editorial estimate. */
  coverage: "high" | "medium" | "low";
  /** Environment variable the fetcher reads, when the blocker is a credential. */
  envVar?: string;
  /** Where the user goes to obtain access. */
  signupUrl?: string;
  /** What is standing in the way, in plain words. */
  blocker?: string;
}

/**
 * The registry. Ordered roughly by how much each would improve Delhi-NCR
 * coverage if connected.
 *
 * Status values here describe THIS repository, not the vendor. Nothing is
 * marked "connected" unless a fetcher actually runs for it in CI.
 */
export const EVENT_SOURCES: EventSource[] = [
  {
    id: "bookmyshow",
    name: "BookMyShow",
    url: "https://in.bookmyshow.com/",
    blurb:
      "India's dominant ticketing platform. Concerts, comedy, theatre, sports and screenings. The single biggest win for Delhi-NCR coverage.",
    method: "scrape",
    status: "needs-worker",
    covers: ["music", "comedy", "theatre", "film", "sports", "entertainment"],
    coverage: "high",
    blocker:
      "No public API. The site is client-rendered and sits behind bot protection, so it needs a headless browser on a server with an India-based IP. A static site cannot do this.",
  },
  {
    id: "district",
    name: "District by Zomato",
    url: "https://www.district.in/",
    blurb:
      "Zomato's events arm, absorbing Paytm Insider. Live music, nightlife, food events and experiences.",
    method: "scrape",
    status: "needs-worker",
    covers: ["music", "nightlife", "food", "comedy", "entertainment"],
    coverage: "high",
    blocker: "No public API. Same headless-browser requirement as BookMyShow.",
  },
  {
    id: "insider",
    name: "Paytm Insider",
    url: "https://insider.in/",
    blurb:
      "Long-running experiences platform. Still lists Delhi events, though its catalogue is migrating to District.",
    method: "scrape",
    status: "needs-worker",
    covers: ["music", "comedy", "workshop", "food", "travel"],
    coverage: "medium",
    blocker: "No public API, and the catalogue is being folded into District.",
  },
  {
    id: "meetup",
    name: "Meetup",
    url: "https://www.meetup.com/",
    blurb:
      "The best source for recurring tech, AI, startup and professional community meetups in Delhi and Gurugram.",
    method: "partner-api",
    status: "needs-account",
    covers: ["tech-ai", "networking", "startup", "career", "hackathon"],
    coverage: "high",
    envVar: "MEETUP_OAUTH_TOKEN",
    signupUrl: "https://www.meetup.com/api/general/",
    blocker:
      "The GraphQL API requires an OAuth client, which means a Meetup account and registering an application.",
  },
  {
    id: "luma",
    name: "Luma (lu.ma)",
    url: "https://lu.ma/",
    blurb:
      "Where most AI, crypto and startup events are hosted now. Calendars expose iCal feeds, which are trivial to ingest.",
    method: "feed",
    status: "planned",
    covers: ["tech-ai", "startup", "networking", "hackathon"],
    coverage: "medium",
    blocker:
      "No central search. You subscribe per-calendar, so I need you to send the Luma calendars worth tracking.",
  },
  {
    id: "ticketmaster",
    name: "Ticketmaster Discovery",
    url: "https://developer.ticketmaster.com/",
    blurb:
      "Already wired into CI. Free key, instant signup. Its India catalogue is thin, so expect few Delhi results.",
    method: "public-api",
    status: "needs-key",
    covers: ["music", "sports", "theatre", "entertainment"],
    coverage: "low",
    envVar: "TICKETMASTER_API_KEY",
    signupUrl: "https://developer.ticketmaster.com/",
    blocker: "Fetcher is built and runs hourly — it just needs the key.",
  },
  {
    id: "eventbrite",
    name: "Eventbrite",
    url: "https://www.eventbrite.com/",
    blurb:
      "Workshops, conferences and professional events. Still widely used by Delhi organisers.",
    method: "partner-api",
    status: "needs-account",
    covers: ["workshop", "knowledge", "networking", "career", "health"],
    coverage: "medium",
    envVar: "EVENTBRITE_TOKEN",
    signupUrl: "https://www.eventbrite.com/platform/",
    blocker:
      "Eventbrite withdrew public event search from its API in 2020. A token now only reads your own organisation's events, so this is useful only if you organise events yourself.",
  },
  {
    id: "allevents",
    name: "AllEvents.in",
    url: "https://allevents.in/",
    blurb:
      "Broad city aggregator with genuinely wide Delhi coverage across every category.",
    method: "partner-api",
    status: "needs-account",
    covers: ["music", "food", "art", "networking", "workshop", "nightlife", "kids"],
    coverage: "high",
    signupUrl: "https://allevents.in/platform/",
    blocker: "An API exists but is commercial — pricing requires contacting them.",
  },
  {
    id: "townscript",
    name: "Townscript",
    url: "https://www.townscript.com/",
    blurb: "Indian self-serve ticketing. Strong for workshops, retreats and marathons.",
    method: "scrape",
    status: "planned",
    covers: ["workshop", "health", "sports", "travel", "spiritual"],
    coverage: "medium",
    blocker: "No documented public API.",
  },
  {
    id: "tentimes",
    name: "10times",
    url: "https://10times.com/",
    blurb: "The most complete directory of B2B trade fairs, expos and conferences.",
    method: "partner-api",
    status: "needs-account",
    covers: ["expo", "knowledge", "policy", "science"],
    coverage: "medium",
    signupUrl: "https://10times.com/api",
    blocker: "Commercial API; requires contacting them for access.",
  },
  {
    id: "devfolio",
    name: "Devfolio",
    url: "https://devfolio.co/",
    blurb: "The main hub for Indian hackathons, including Delhi-NCR college events.",
    method: "scrape",
    status: "planned",
    covers: ["hackathon", "tech-ai", "startup"],
    coverage: "medium",
    blocker: "No public API; listing pages would need parsing.",
  },
  {
    id: "gdg",
    name: "GDG / Google Developer Groups",
    url: "https://gdg.community.dev/",
    blurb: "Official Google developer community events for Delhi, Gurugram and Noida.",
    method: "feed",
    status: "planned",
    covers: ["tech-ai", "workshop", "networking"],
    coverage: "low",
    blocker: "Chapter pages are predictable enough to parse; no key needed.",
  },
  {
    id: "venues",
    name: "Delhi venue calendars",
    url: "https://iicdelhi.nic.in/",
    blurb:
      "India Habitat Centre, India International Centre, Kamani, Siri Fort, NSD and Pragati Maidan publish their own programmes — the authentic cultural calendar most aggregators miss.",
    method: "scrape",
    status: "planned",
    covers: ["theatre", "art", "dance", "literature", "film", "policy", "expo"],
    coverage: "medium",
    blocker:
      "Each venue is a separate small scraper. High editorial value, low volume.",
  },
];

export const INGEST_METHOD_META: Record<
  IngestMethod,
  { label: string; detail: string; color: string; bg: string; border: string }
> = {
  "public-api": {
    label: "Public API",
    detail: "Documented API. Self-serve key, works immediately.",
    color: "text-green-700", bg: "bg-green-50", border: "border-green-200",
  },
  "partner-api": {
    label: "Partner API",
    detail: "API exists but access must be granted by the vendor.",
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
  },
  feed: {
    label: "Feed",
    detail: "Public RSS / JSON / iCal feed. No credential needed.",
    color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200",
  },
  scrape: {
    label: "Scraper",
    detail: "No API. Needs a headless browser on a real server.",
    color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200",
  },
  manual: {
    label: "Manual",
    detail: "Curated by hand.",
    color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200",
  },
};

export const SOURCE_STATUS_META: Record<
  SourceStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  connected: { label: "Connected", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  "needs-key": { label: "Needs API key", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  "needs-account": { label: "Needs account", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  "needs-worker": { label: "Needs server", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500" },
  planned: { label: "Planned", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400" },
};

/** Sources blocked only on a credential you can obtain yourself today. */
export function selfServeSources(): EventSource[] {
  return EVENT_SOURCES.filter((s) => s.status === "needs-key");
}

export function sourcesByCoverage(): EventSource[] {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return [...EVENT_SOURCES].sort((a, b) => rank[a.coverage] - rank[b.coverage]);
}
