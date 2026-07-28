import { Event } from "@/types/event";

/**
 * LINK RELIABILITY POLICY
 * =======================
 * A previous version of this file deep-linked into platform-internal search
 * paths (e.g. `in.bookmyshow.com/explore/search/?q=...`). Those paths were
 * guessed, not verified, and they 404'd in production.
 *
 * This build environment cannot reach in.bookmyshow.com, insider.in, or even
 * google.com (the egress proxy returns 403 on CONNECT), so NO platform URL can
 * be empirically verified here. The policy therefore is:
 *
 *   Never link to a URL whose existence depends on a guess.
 *
 * We only emit two shapes of URL:
 *   1. Origin roots  (https://in.bookmyshow.com/) — a site's homepage does not
 *      404 while the site is up.
 *   2. Google queries (https://www.google.com/search?q=...) — a search engine
 *      returns a results page for ANY query string. It cannot 404.
 *
 * A Google query scoped with `site:` lands the user on the platform's real
 * listing in one click, which is strictly better than a fabricated deep link.
 */

export type RouteReliability = "guaranteed" | "stable";

export interface BookingRoute {
  label: string;
  url: string;
  /** Why this route is safe, shown as helper text in the Booking Hub. */
  note: string;
  reliability: RouteReliability;
  icon: string;
}

/** Origin roots we are willing to link to directly. Homepages, never deep paths. */
const PLATFORM_HOME: Record<string, { label: string; url: string }> = {
  bookmyshow: { label: "BookMyShow", url: "https://in.bookmyshow.com/" },
  insider: { label: "Paytm Insider", url: "https://insider.in/" },
  district: { label: "District by Zomato", url: "https://www.district.in/" },
  eventbrite: { label: "Eventbrite", url: "https://www.eventbrite.com/" },
  gdg: { label: "GDG Community", url: "https://gdg.community.dev/" },
  aws: { label: "AWS Events", url: "https://aws.amazon.com/events/" },
  microsoft: { label: "Microsoft Events", url: "https://events.microsoft.com/" },
  ted: { label: "TED", url: "https://www.ted.com/" },
  meetup: { label: "Meetup", url: "https://www.meetup.com/" },
};

/** Map an event's declared platform onto a known origin root, if we have one. */
function platformKey(event: Event): string | null {
  const hay = `${event.ticket.platform ?? ""} ${event.ticket.link ?? ""}`.toLowerCase();
  if (hay.includes("bookmyshow")) return "bookmyshow";
  if (hay.includes("insider")) return "insider";
  if (hay.includes("district")) return "district";
  if (hay.includes("eventbrite")) return "eventbrite";
  if (hay.includes("gdg")) return "gdg";
  if (hay.includes("aws") || hay.includes("amazon")) return "aws";
  if (hay.includes("microsoft") || hay.includes("aitour")) return "microsoft";
  if (hay.includes("ted")) return "ted";
  if (hay.includes("meetup")) return "meetup";
  return null;
}

function googleQuery(q: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** Hostname of a URL, or null if it isn't parseable. */
function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * The primary "Get Tickets" destination.
 *
 * For live-API events we trust the API's own listing URL — that link came from
 * the ticketing provider itself and points at a real purchasable page.
 *
 * For every sample event we send the user to a Google search. It always loads,
 * and it puts the genuine booking page (if one exists) at the top.
 */
export function resolveTicketUrl(event: Event): string {
  if (event.sourceType === "live-api" && event.ticket.link) {
    return event.ticket.link;
  }
  return googleQuery(`${event.name} ${event.area} tickets`);
}

/**
 * Every route we can offer for this event, best-first. The Booking Hub renders
 * all of them so a user always has a working path even if one is unhelpful.
 */
export function getBookingRoutes(event: Event): BookingRoute[] {
  const routes: BookingRoute[] = [];
  const key = platformKey(event);
  const home = key ? PLATFORM_HOME[key] : null;

  // 1. A real listing URL, but only when it came from a ticketing API.
  if (event.sourceType === "live-api" && event.ticket.link) {
    routes.push({
      label: "Buy on the official listing",
      url: event.ticket.link,
      note: "Direct listing URL supplied by the ticketing provider's API.",
      reliability: "stable",
      icon: "🎟",
    });
  }

  // 2. Plain Google search — cannot 404, finds the event wherever it is sold.
  routes.push({
    label: "Search Google for this event",
    url: googleQuery(`${event.name} ${event.area} tickets`),
    note: "A search page always loads. Best route to the genuine booking page.",
    reliability: "guaranteed",
    icon: "🔍",
  });

  // 3. Site-scoped Google search — lands on the platform's own listing.
  if (home) {
    const hostname = hostOf(home.url);
    if (hostname) {
      routes.push({
        label: `Find it on ${home.label}`,
        url: googleQuery(`site:${hostname} ${event.name}`),
        note: `Searches ${hostname} directly. Skips guessed URLs that can 404.`,
        reliability: "guaranteed",
        icon: "🎯",
      });
    }
  }

  // 4. Platform homepage — a live site's root does not 404.
  if (home) {
    routes.push({
      label: `Browse ${home.label}`,
      url: home.url,
      note: "Homepage. Use the site's own search if the routes above miss.",
      reliability: "stable",
      icon: "🏠",
    });
  }

  // 5. Organiser — search by name rather than trusting a possibly-dead domain.
  routes.push({
    label: `Check the organiser (${event.organizer})`,
    url: googleQuery(`${event.organizer} ${event.name}`),
    note: "Organisers often sell or announce tickets on their own site first.",
    reliability: "guaranteed",
    icon: "🏢",
  });

  return routes;
}

/** Button label reflects both ticket status and data provenance. */
export function bookingButtonLabel(event: Event): string {
  if (event.sourceType !== "live-api") return "Find Tickets";
  switch (event.ticket.status) {
    case "free":
      return "Register Free";
    case "coming-soon":
      return "Notify Me";
    case "sold-out":
    case "closed":
      return "Search Resale";
    default:
      return "Get Tickets";
  }
}

export function canBook(event: Event): boolean {
  return event.ticket.status !== "sold-out" && event.ticket.status !== "closed";
}

/** True when we can honestly claim this links to a real, purchasable listing. */
export function hasVerifiedListing(event: Event): boolean {
  return event.sourceType === "live-api" && !!event.ticket.link;
}
