import { EventSource } from "./sources";

/**
 * Things only the account owner can do. Everything here is a real blocker: if
 * an item is undone, the feature it unlocks does not work — no amount of code
 * substitutes for a credential or a hosting decision.
 */

export type ReqPriority = "blocker" | "high" | "nice";
export type ReqEffort = "2 min" | "15 min" | "1 hour" | "varies";
export type ReqCost = "free" | "paid" | "varies";

export interface Requirement {
  id: string;
  title: string;
  /** What you do. Written as instructions, not description. */
  steps: string[];
  /** What it switches on. */
  unlocks: string;
  /** The consequence of skipping it. */
  ifSkipped: string;
  priority: ReqPriority;
  effort: ReqEffort;
  cost: ReqCost;
  /** Where to go. Origin roots and documented signup pages only. */
  link?: string;
  linkLabel?: string;
  /** GitHub Actions secret name, where applicable. */
  secret?: string;
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: "pages",
    title: "Turn on GitHub Pages",
    steps: [
      "Open the repository on GitHub.",
      "Go to Settings → Pages.",
      "Under 'Source', choose 'GitHub Actions'.",
      "Save. The next push publishes the site.",
    ],
    unlocks: "The public URL. Until this is set, the deploy workflow has nowhere to publish.",
    ifSkipped: "The site only runs on your machine via npm run dev.",
    priority: "blocker",
    effort: "2 min",
    cost: "free",
    linkLabel: "Repository settings",
  },
  {
    id: "ticketmaster",
    title: "Add a Ticketmaster API key",
    steps: [
      "Sign up at developer.ticketmaster.com (free, instant).",
      "Copy the Consumer Key from your app dashboard.",
      "In the repo: Settings → Secrets and variables → Actions → New repository secret.",
      "Name it TICKETMASTER_API_KEY and paste the key.",
    ],
    unlocks:
      "The first real listings. Fetched events carry genuine purchase links and flip from 'Sample data' to 'Live listing'.",
    ifSkipped:
      "Every event stays sample content and booking buttons run a web search instead of opening a purchase page.",
    priority: "blocker",
    effort: "15 min",
    cost: "free",
    link: "https://developer.ticketmaster.com/",
    linkLabel: "developer.ticketmaster.com",
    secret: "TICKETMASTER_API_KEY",
  },
  {
    id: "scraper-host",
    title: "Decide how to handle BookMyShow and District",
    steps: [
      "Decide whether you want these sources enough to run a small always-on server.",
      "If yes: pick a host that can run a headless browser (a $5–10/month VPS, Fly.io, Railway or similar).",
      "Tell me which, and I will write the worker and the endpoint the site reads from.",
      "If no: the site keeps using search-based booking routes, which still reach the right page in one click.",
    ],
    unlocks:
      "The two platforms that actually matter for Delhi-NCR: concerts, comedy, theatre, sports and nightlife.",
    ifSkipped:
      "Those categories stay thin. This is the single biggest gap, and it is a hosting decision, not a coding one.",
    priority: "high",
    effort: "varies",
    cost: "paid",
  },
  {
    id: "meetup",
    title: "Create a Meetup API client",
    steps: [
      "Sign in at meetup.com and open the API documentation.",
      "Register an OAuth client to get a client ID and secret.",
      "Add them as MEETUP_CLIENT_ID and MEETUP_CLIENT_SECRET repository secrets.",
    ],
    unlocks:
      "Recurring tech, AI, startup and professional meetups across Delhi and Gurugram — the densest source of the events you originally asked for.",
    ifSkipped: "Community meetups are missing; only large ticketed events appear.",
    priority: "high",
    effort: "1 hour",
    cost: "free",
    link: "https://www.meetup.com/api/general/",
    linkLabel: "Meetup API docs",
    secret: "MEETUP_CLIENT_ID / MEETUP_CLIENT_SECRET",
  },
  {
    id: "luma",
    title: "Send me the Luma calendars you care about",
    steps: [
      "Browse lu.ma and find the Delhi/Gurugram calendars you follow.",
      "Copy their URLs (for example lu.ma/delhi-ai).",
      "Paste them to me — three to ten is plenty to start.",
    ],
    unlocks:
      "AI, crypto and startup events, which increasingly live on Luma and nowhere else. Calendars expose iCal feeds, so no key is needed.",
    ifSkipped: "The AI/startup scene stays under-represented.",
    priority: "high",
    effort: "15 min",
    cost: "free",
    link: "https://lu.ma/",
    linkLabel: "lu.ma",
  },
  {
    id: "categories",
    title: "Tell me which categories you actually want",
    steps: [
      "The dashboard now carries 28 categories across Professional, Learning, Culture, Lifestyle and Commerce.",
      "Tell me which matter to you and which are noise.",
      "I will promote your picks and drop the rest from the default view.",
    ],
    unlocks:
      "A dashboard tuned to you rather than a generic listing. Affects default filters, sort order and what the AI assistant recommends first.",
    ifSkipped: "All 28 categories show equally and the page is busier than it needs to be.",
    priority: "high",
    effort: "2 min",
    cost: "free",
  },
  {
    id: "payments",
    title: "Decide on in-app payments",
    steps: [
      "Right now the site hands users off to the platform that actually sells the ticket, which is the correct and safe default.",
      "Taking payment yourself means becoming a merchant: a Razorpay or Stripe account, KYC, a server to hold keys, refund handling and liability for tickets you do not control.",
      "If you still want it, say so and I will scope it properly — but it is a different product, not a feature.",
    ],
    unlocks: "Checkout without leaving the site.",
    ifSkipped:
      "Nothing breaks. Users complete payment on the platform that issues the ticket, which is also where refunds and support live.",
    priority: "nice",
    effort: "varies",
    cost: "paid",
  },
  {
    id: "domain",
    title: "Point a custom domain at it (optional)",
    steps: [
      "Buy a domain if you want one.",
      "Add a CNAME record pointing to <your-username>.github.io.",
      "Enter the domain under Settings → Pages → Custom domain.",
    ],
    unlocks: "A real address instead of a github.io sub-path.",
    ifSkipped: "The site works fine on the github.io URL.",
    priority: "nice",
    effort: "15 min",
    cost: "paid",
  },
  {
    id: "legal",
    title: "Know the scraping ground rules before I build workers",
    steps: [
      "Scraping a site you do not own can breach its terms of service, even when the data is public.",
      "For anything beyond personal use, check each platform's terms or look for an affiliate/partner programme — several pay commission on referred ticket sales.",
      "Confirm you have read this before I build any scraper.",
    ],
    unlocks: "A legally sound basis for the aggregator.",
    ifSkipped:
      "Risk of being IP-blocked or receiving a takedown. I will not build scrapers until you have acknowledged this.",
    priority: "high",
    effort: "15 min",
    cost: "free",
  },
];

export const PRIORITY_META: Record<
  ReqPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  blocker: { label: "Blocker", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  high: { label: "High value", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  nice: { label: "Optional", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

/** Requirements that unblock a given source, matched by secret or id. */
export function requirementsForSource(source: EventSource): Requirement[] {
  return REQUIREMENTS.filter(
    (r) => r.id === source.id || (!!source.envVar && r.secret?.includes(source.envVar)),
  );
}
