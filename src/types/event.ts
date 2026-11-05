/**
 * Category taxonomy.
 *
 * Deliberately broad: the aggregator pulls from ticketing platforms, meetup
 * networks, venue sites and community calendars, each of which uses its own
 * vocabulary. A wide set here means an incoming event rarely has to be dumped
 * into "other", which is what makes category filtering actually useful.
 *
 * The first six keys predate this expansion and are kept so existing saved
 * filters and seed data keep resolving.
 */
export type EventCategory =
  // Professional
  | "tech-ai"
  | "finance"
  | "consulting"
  | "startup"
  | "career"
  | "policy"
  | "science"
  | "networking"
  // Learning
  | "knowledge"
  | "workshop"
  | "hackathon"
  | "literature"
  | "education"
  // Culture & entertainment
  | "entertainment"
  | "music"
  | "comedy"
  | "theatre"
  | "film"
  | "art"
  | "dance"
  | "fashion"
  // Lifestyle
  | "sports"
  | "health"
  | "food"
  | "travel"
  | "spiritual"
  | "kids"
  | "gaming"
  | "nightlife"
  // Commerce
  | "expo"
  | "other";

/** Groups used to organise the sidebar and filter chips. */
export type CategoryGroup =
  | "Professional"
  | "Learning"
  | "Culture"
  | "Lifestyle"
  | "Commerce"
  | "Other";

export type TicketStatus = "available" | "selling-fast" | "few-left" | "sold-out" | "closed" | "coming-soon" | "free";

export interface TicketTier {
  name: string;
  price: string;
  status: TicketStatus;
  perks?: string[];
}

export interface EventTicket {
  available: boolean;
  status: TicketStatus;
  price?: string;
  link?: string;
  platform?: string;
  tiers?: TicketTier[];
  registrationDeadline?: string;
  bookingSteps?: string[];
}

/**
 * Where an event's data came from. This drives the trust badge in the UI.
 *
 * - "live-api"  → pulled from a real ticketing API at build time. Its ticket
 *                 link points at a genuine, purchasable listing.
 * - "sample"    → illustrative placeholder content authored for the demo.
 *                 The event may not exist; its ticket link is a SEARCH, not a
 *                 real listing page. Never present these as confirmed.
 */
export type SourceType = "live-api" | "sample";

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  time: string;
  venue: string;
  address: string;
  area: string;
  description: string;
  highlights: string[];
  organizer: string;
  expectedAttendees?: string;
  format: "in-person" | "hybrid" | "online";
  ticket: EventTicket;
  tags: string[];
  imageUrl?: string;
  sourceUrl?: string;
  featured?: boolean;
  /** Provenance. Defaults to "sample" when absent — fail closed, never fake trust. */
  sourceType?: SourceType;
  /** ISO timestamp of when this record was last confirmed against its source. */
  lastVerified?: string;
}

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  available: { label: "Available", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  "selling-fast": { label: "Selling Fast", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  "few-left": { label: "Few Left!", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500 animate-pulse" },
  "sold-out": { label: "Sold Out", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-300", dot: "bg-slate-400" },
  closed: { label: "Registration Closed", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-300", dot: "bg-slate-400" },
  "coming-soon": { label: "Coming Soon", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  free: { label: "Free Entry", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
};

export interface CategoryMeta {
  label: string;
  group: CategoryGroup;
  color: string;
  bg: string;
  border: string;
  icon: string;
  /** Keywords a classifier matches against when importing from a source. */
  match: string[];
}

/**
 * Tailwind class names must appear as complete literals for the compiler to
 * find them, so each entry spells its palette out rather than composing names.
 */
export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  // ---- Professional -------------------------------------------------------
  "tech-ai": { label: "Tech & AI", group: "Professional", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: "🤖",
    match: ["ai", "tech", "software", "developer", "cloud", "data", "machine learning", "llm", "devops", "cyber", "blockchain", "web3", "robotics", "saas", "api"] },
  finance: { label: "Finance", group: "Professional", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "💹",
    match: ["finance", "fintech", "investment", "banking", "trading", "stock", "crypto", "wealth", "insurance", "cfa", "accounting", "tax"] },
  consulting: { label: "Consulting", group: "Professional", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: "📊",
    match: ["consulting", "strategy", "case study", "management", "mba", "advisory", "operations"] },
  startup: { label: "Startup & VC", group: "Professional", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: "🚀",
    match: ["startup", "founder", "venture", "vc", "pitch", "demo day", "incubator", "accelerator", "angel", "funding", "unicorn"] },
  career: { label: "Career & Jobs", group: "Professional", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", icon: "💼",
    match: ["career", "job fair", "hiring", "recruitment", "placement", "resume", "interview", "internship"] },
  policy: { label: "Policy & Govt", group: "Professional", color: "text-stone-700", bg: "bg-stone-50", border: "border-stone-200", icon: "🏛",
    match: ["policy", "government", "governance", "public sector", "regulation", "parliament", "civic", "diplomacy"] },
  science: { label: "Science", group: "Professional", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", icon: "🔬",
    match: ["science", "research", "biotech", "physics", "chemistry", "astronomy", "climate", "space", "medical research"] },
  networking: { label: "Networking", group: "Professional", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: "🤝",
    match: ["networking", "meetup", "mixer", "connect", "community", "roundtable"] },

  // ---- Learning -----------------------------------------------------------
  knowledge: { label: "Talks & Confs", group: "Learning", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "📚",
    match: ["conference", "summit", "talk", "seminar", "symposium", "ted", "lecture", "keynote", "panel", "forum"] },
  workshop: { label: "Workshops", group: "Learning", color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-200", icon: "🛠",
    match: ["workshop", "bootcamp", "masterclass", "training", "course", "certification", "hands-on", "lab"] },
  hackathon: { label: "Hackathons", group: "Learning", color: "text-fuchsia-700", bg: "bg-fuchsia-50", border: "border-fuchsia-200", icon: "👨‍💻",
    match: ["hackathon", "hack", "codefest", "coding competition", "ctf", "datathon", "ideathon"] },
  literature: { label: "Books", group: "Learning", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: "📖",
    match: ["book", "literature", "author", "poetry", "writing", "publishing", "litfest", "storytelling"] },
  education: { label: "Education", group: "Learning", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: "🎓",
    match: ["education", "school", "college", "university", "admission", "exam", "scholarship", "study abroad"] },

  // ---- Culture ------------------------------------------------------------
  entertainment: { label: "Entertainment", group: "Culture", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: "🎉",
    match: ["entertainment", "show", "celebrity", "live show", "variety"] },
  music: { label: "Music", group: "Culture", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200", icon: "🎵",
    match: ["music", "concert", "gig", "band", "dj", "festival", "singer", "orchestra", "classical", "rock", "hip hop", "edm", "sufi", "ghazal", "qawwali"] },
  comedy: { label: "Comedy", group: "Culture", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "🎤",
    match: ["comedy", "standup", "stand-up", "improv", "humour", "humor", "open mic", "roast"] },
  theatre: { label: "Theatre", group: "Culture", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "🎭",
    match: ["theatre", "theater", "play", "drama", "musical", "nukkad", "stage"] },
  film: { label: "Film", group: "Culture", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: "🎬",
    match: ["film", "movie", "cinema", "screening", "documentary", "premiere", "short film"] },
  art: { label: "Art", group: "Culture", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: "🎨",
    match: ["art", "exhibition", "gallery", "painting", "sculpture", "photography", "craft", "installation", "biennale"] },
  dance: { label: "Dance", group: "Culture", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: "💃",
    match: ["dance", "ballet", "kathak", "bharatanatyam", "salsa", "choreography", "zumba"] },
  fashion: { label: "Fashion", group: "Culture", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200", icon: "👗",
    match: ["fashion", "runway", "couture", "designer", "style", "beauty", "makeup"] },

  // ---- Lifestyle ----------------------------------------------------------
  sports: { label: "Sports", group: "Lifestyle", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: "⚽",
    match: ["sport", "cricket", "football", "marathon", "run", "tournament", "match", "league", "tennis", "badminton", "kabaddi", "cycling"] },
  health: { label: "Health", group: "Lifestyle", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🧘",
    match: ["health", "wellness", "yoga", "meditation", "fitness", "mental health", "therapy", "nutrition", "mindfulness"] },
  food: { label: "Food & Drink", group: "Lifestyle", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: "🍽",
    match: ["food", "culinary", "restaurant", "tasting", "brunch", "wine", "beer", "brewery", "cafe", "chef", "baking"] },
  travel: { label: "Travel", group: "Lifestyle", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: "🏕",
    match: ["travel", "trek", "hike", "camping", "adventure", "trip", "tour", "expedition", "roadtrip"] },
  spiritual: { label: "Spiritual", group: "Lifestyle", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "🕉",
    match: ["spiritual", "satsang", "kirtan", "temple", "devotional", "retreat", "faith", "puja"] },
  kids: { label: "Kids & Family", group: "Lifestyle", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", icon: "🧒",
    match: ["kids", "children", "family", "toddler", "parenting", "puppet", "storytime"] },
  gaming: { label: "Gaming", group: "Lifestyle", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: "🎮",
    match: ["gaming", "esports", "lan", "tournament gaming", "console", "board game", "chess", "quiz"] },
  nightlife: { label: "Nightlife", group: "Lifestyle", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: "🌃",
    match: ["nightlife", "party", "club", "nightclub", "rave", "after party", "lounge"] },

  // ---- Commerce -----------------------------------------------------------
  expo: { label: "Expos & Fairs", group: "Commerce", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: "🏢",
    match: ["expo", "trade fair", "exhibition hall", "b2b", "showcase", "convention", "mart", "flea", "bazaar"] },
  other: { label: "Other", group: "Other", color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: "📌",
    match: [] },
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  "Professional",
  "Learning",
  "Culture",
  "Lifestyle",
  "Commerce",
  "Other",
];

/** Categories belonging to a group, in declaration order. */
export function categoriesInGroup(group: CategoryGroup): EventCategory[] {
  return (Object.keys(CATEGORY_META) as EventCategory[]).filter(
    (k) => CATEGORY_META[k].group === group,
  );
}

/**
 * Best-effort classifier for events arriving from an external source.
 * Scores each category by how many of its keywords appear in the text and
 * returns the strongest match, falling back to "other".
 */
export function classifyEvent(text: string): EventCategory {
  const hay = text.toLowerCase();
  let best: EventCategory = "other";
  let bestScore = 0;
  for (const [key, meta] of Object.entries(CATEGORY_META) as [EventCategory, CategoryMeta][]) {
    let score = 0;
    for (const kw of meta.match) if (hay.includes(kw)) score += kw.length;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}
