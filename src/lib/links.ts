import { Event } from "@/types/event";

/**
 * Parse a 12-hour time string like "09:00 AM" / "6:00 PM" into [hours, minutes]
 * in 24-hour form. Falls back to [9, 0] when it can't be parsed.
 */
function parseTime(time: string): [number, number] {
  const m = time.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return [9, 0];
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return [h, min];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local (IST) datetime stamp YYYYMMDDTHHMMSS for a given date + hour/min. */
function localStamp(dateStr: string, h: number, min: number): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(min)}00`;
}

/** UTC stamp YYYYMMDDTHHMMSSZ converting from IST (UTC+5:30). */
function utcStamp(dateStr: string, h: number, min: number): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  // Construct the moment as IST, then read the UTC components.
  const utc = new Date(Date.UTC(y, mo - 1, d, h, min) - 5.5 * 3600 * 1000);
  return (
    `${utc.getUTCFullYear()}${pad(utc.getUTCMonth() + 1)}${pad(utc.getUTCDate())}` +
    `T${pad(utc.getUTCHours())}${pad(utc.getUTCMinutes())}00Z`
  );
}

function fullLocation(event: Event): string {
  return [event.venue, event.address, event.area].filter(Boolean).join(", ");
}

/** Google Maps deep link to the venue (official Maps URL API — always resolves). */
export function mapsUrl(event: Event): string {
  const query = encodeURIComponent(fullLocation(event));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** "Add to Google Calendar" template link (pre-fills the create-event form). */
export function googleCalendarUrl(event: Event): string {
  const [h, min] = parseTime(event.time);
  let start: string;
  let end: string;

  if (event.endDate && event.endDate !== event.date) {
    // Multi-day → all-day span (end date is exclusive in Google Calendar).
    const [y, mo, d] = event.endDate.split("-").map(Number);
    const endExclusive = new Date(Date.UTC(y, mo - 1, d + 1));
    start = event.date.replace(/-/g, "");
    end = `${endExclusive.getUTCFullYear()}${pad(endExclusive.getUTCMonth() + 1)}${pad(endExclusive.getUTCDate())}`;
  } else {
    // Single day → assume a 3-hour window.
    start = localStamp(event.date, h, min);
    const endH = (h + 3) % 24;
    end = localStamp(event.date, endH < h ? 23 : endH, endH < h ? 59 : min);
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${start}/${end}`,
    details: `${event.description}\n\nOrganiser: ${event.organizer}\nTickets: ${event.ticket.price ?? "See listing"}`,
    location: fullLocation(event),
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a valid iCalendar (.ics) file body for the event (CRLF line endings). */
export function buildIcs(event: Event): string {
  const [h, min] = parseTime(event.time);
  const dtStart = utcStamp(event.date, h, min);
  const endDate = event.endDate && event.endDate !== event.date ? event.endDate : event.date;
  const endH = event.endDate && event.endDate !== event.date ? h : (h + 3) % 24;
  const dtEnd = utcStamp(endDate, endH < h && endDate === event.date ? 23 : endH, min);
  const stamp = dtStart;

  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Delhi NCR Events Tracker//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@delhi-ncr-events`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(event.name)}`,
    `DESCRIPTION:${esc(event.description)}`,
    `LOCATION:${esc(fullLocation(event))}`,
    `URL:${event.ticket.link ?? event.sourceUrl ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Trigger a client-side download of the event as an .ics file. */
export function downloadIcs(event: Event): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** A Google search that always lands on a real page from which the event is reachable. */
export function googleSearchUrl(event: Event): string {
  const q = encodeURIComponent(`${event.name} ${event.area} ${event.ticket.platform ?? "tickets"}`);
  return `https://www.google.com/search?q=${q}`;
}
