import { NextResponse } from "next/server";
import { DELHI_NCR_EVENTS, getUpcomingEvents } from "@/lib/events-data";

export async function GET() {
  const upcoming = getUpcomingEvents(DELHI_NCR_EVENTS);
  return NextResponse.json({
    events: upcoming,
    total: upcoming.length,
    lastUpdated: new Date().toISOString(),
  });
}
