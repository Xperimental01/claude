import { Event } from "@/types/event";

/**
 * Returns the best possible ticket/booking URL for an event.
 *
 * Priority:
 * 1. Platform-specific search deep-link (always resolves to a real page)
 * 2. Known-working organiser landing page
 * 3. Google search fallback (guaranteed to load)
 */
export function resolveTicketUrl(event: Event): string {
  const name = event.name;
  const platform = (event.ticket.platform ?? "").toLowerCase();
  const existing = event.ticket.link ?? "";

  // BookMyShow — use their search which always resolves
  if (platform.includes("bookmyshow") || existing.includes("bookmyshow.com")) {
    return `https://in.bookmyshow.com/explore/search/?q=${encodeURIComponent(name)}`;
  }

  // Paytm Insider / District (Zomato)
  if (
    platform.includes("insider") ||
    existing.includes("insider.in") ||
    existing.includes("nh7")
  ) {
    return `https://insider.in/search?q=${encodeURIComponent(name)}`;
  }

  // Eventbrite India
  if (platform.includes("eventbrite") || existing.includes("eventbrite")) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
    return `https://www.eventbrite.in/d/india--new-delhi/${slug}/?q=${encodeURIComponent(name)}`;
  }

  // GDG Community — page always works
  if (
    platform.includes("gdg") ||
    existing.includes("gdg.community.dev")
  ) {
    return "https://gdg.community.dev/gdg-new-delhi";
  }

  // AWS Events — their India events page is stable
  if (platform.includes("aws") || existing.includes("aws.amazon.com/events")) {
    return "https://aws.amazon.com/events/india";
  }

  // Microsoft AI Tour — stable landing
  if (platform.includes("microsoft") || existing.includes("aitour.microsoft.com")) {
    return "https://aitour.microsoft.com/";
  }

  // TED/TEDx — search on TED site
  if (platform.includes("ted") || existing.includes("ted.com")) {
    return `https://www.ted.com/search?q=${encodeURIComponent(name)}`;
  }

  // CFA Society India
  if (platform.includes("cfa") || existing.includes("cfasociety")) {
    return "https://www.cfasocietyindia.org/events";
  }

  // Startup India Portal
  if (platform.includes("startup india") || existing.includes("startupindia.gov.in")) {
    return "https://www.startupindia.gov.in/content/sih/en/events.html";
  }

  // NASSCOM
  if (existing.includes("nasscom.in")) {
    return "https://nasscom.in/events";
  }

  // McKinsey
  if (existing.includes("mckinsey.com")) {
    return "https://www.mckinsey.com/in-en/events";
  }

  // National Book Trust book fair
  if (existing.includes("ndwbf.org")) {
    return "https://www.ndwbf.org";
  }

  // IIM Rohtak
  if (existing.includes("iimrohtak.ac.in")) {
    return "https://www.iimrohtak.ac.in/events.html";
  }

  // Bharat Web3
  if (existing.includes("bharatweb3.org")) {
    return "https://www.bharatweb3.org/events";
  }

  // Messe Düsseldorf India
  if (existing.includes("messeduesseldorf") || existing.includes("india.messe")) {
    return "https://www.india.messeduesseldorf.in/Events";
  }

  // If the existing link looks like a real specific page (not just a homepage), keep it
  const isSpecificPage =
    existing.length > 0 &&
    existing !== "https://in.bookmyshow.com" &&
    existing !== "https://insider.in" &&
    /\/(events?|tickets?|register|booking|show|concert|festival|summit|conference|expo)/.test(
      existing
    );
  if (isSpecificPage) return existing;

  // Ultimate fallback: Google search — always loads
  return googleSearchFallback(event);
}

export function googleSearchFallback(event: Event): string {
  const q = `${event.name} ${event.area} tickets booking`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** The label shown on the booking button based on ticket status */
export function bookingButtonLabel(event: Event): string {
  const status = event.ticket.status;
  if (status === "free") return "Register Free →";
  if (status === "coming-soon") return "Notify Me →";
  if (status === "sold-out" || status === "closed") return "Find Alternatives →";
  return "Get Tickets →";
}

/** Whether we should show a booking button at all */
export function canBook(event: Event): boolean {
  return event.ticket.status !== "sold-out" && event.ticket.status !== "closed";
}
