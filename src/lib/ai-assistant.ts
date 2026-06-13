import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import { format, parseISO } from "date-fns";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  eventSuggestions?: Event[];
}

function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[?!.,]/g, "").trim();
}

function formatDate(d: string) {
  try { return format(parseISO(d), "dd MMM yyyy"); } catch { return d; }
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function findEventsForQuery(query: string, events: Event[]): Event[] {
  const q = normalizeQuery(query);
  return events.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      e.venue.toLowerCase().includes(q) ||
      e.area.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q)
  );
}

export function getAIResponse(userMessage: string, events: Event[]): ChatMessage {
  const q = normalizeQuery(userMessage);

  // Greeting
  if (matchesKeywords(q, ["hello", "hi", "hey", "hola", "namaste"])) {
    return {
      role: "assistant",
      content:
        "Hello! I'm your Delhi NCR Events Assistant. I can help you:\n\n" +
        "• **Find events** by type (AI, music, finance, etc.)\n" +
        "• **Check ticket availability** and pricing\n" +
        "• **Guide you through booking** step by step\n" +
        "• **Recommend events** based on your interests\n" +
        "• **Compare events** side by side\n\n" +
        "Try asking: *\"Show me AI events\"* or *\"How do I book Coldplay tickets?\"*",
    };
  }

  // Help
  if (matchesKeywords(q, ["help", "what can you do", "features", "how to use"])) {
    return {
      role: "assistant",
      content:
        "Here's what I can do:\n\n" +
        "🔍 **Search**: *\"tech events in Gurugram\"*, *\"free events this month\"*\n" +
        "🎫 **Tickets**: *\"Is Coldplay sold out?\"*, *\"cheapest tickets for NH7\"*\n" +
        "📋 **Booking help**: *\"How to book TEDx tickets?\"*, *\"steps to register for AWS event\"*\n" +
        "💡 **Recommend**: *\"Suggest events for a developer\"*, *\"best finance events\"*\n" +
        "📅 **Schedule**: *\"What's happening this week?\"*, *\"events in July\"*\n" +
        "📊 **Compare**: *\"Compare tech events\"*, *\"free vs paid events\"*",
    };
  }

  // Ticket availability questions
  if (matchesKeywords(q, ["sold out", "available", "ticket", "tickets", "book", "buy", "register", "registration", "price", "cost", "fee", "how much"])) {
    // Check if asking about a specific event
    const matchedEvents = findEventsForQuery(q, events);

    if (matchedEvents.length === 1) {
      const e = matchedEvents[0];
      const status = TICKET_STATUS_META[e.ticket.status];
      const deadlinePassed = e.ticket.registrationDeadline
        ? new Date(e.ticket.registrationDeadline) < new Date()
        : false;

      let response = `**${e.name}**\n\n`;
      response += `🎫 Status: **${status.label}**\n`;
      response += `💰 Price: ${e.ticket.price}\n`;
      response += `🏪 Platform: ${e.ticket.platform}\n`;

      if (e.ticket.registrationDeadline) {
        response += `📅 Deadline: ${formatDate(e.ticket.registrationDeadline)}${deadlinePassed ? " ⚠️ **(PASSED)**" : ""}\n`;
      }

      if (e.ticket.tiers && e.ticket.tiers.length > 0) {
        response += "\n**Available tiers:**\n";
        e.ticket.tiers.forEach((t) => {
          const ts = TICKET_STATUS_META[t.status];
          const strikethrough = t.status === "sold-out" ? "~~" : "";
          response += `• ${strikethrough}${t.name} — ${t.price}${strikethrough} (${ts.label})\n`;
        });
      }

      if (
        e.ticket.status !== "sold-out" &&
        e.ticket.status !== "closed" &&
        !deadlinePassed &&
        e.ticket.bookingSteps
      ) {
        response += "\n**How to book:**\n";
        e.ticket.bookingSteps.forEach((s, i) => {
          response += `${i + 1}. ${s}\n`;
        });
        if (e.ticket.link) {
          response += `\n👉 **[Book here](${e.ticket.link})**`;
        }
      } else if (e.ticket.status === "sold-out" || deadlinePassed) {
        response += "\n⛔ Unfortunately, this event is no longer accepting bookings.";
        const similar = events.filter(
          (ev) => ev.category === e.category && ev.id !== e.id && ev.ticket.status !== "sold-out" && ev.ticket.status !== "closed"
        );
        if (similar.length > 0) {
          response += " Here are similar events still available:";
          return { role: "assistant", content: response, eventSuggestions: similar.slice(0, 3) };
        }
      }

      return { role: "assistant", content: response, eventSuggestions: [e] };
    }

    if (matchedEvents.length > 1) {
      const available = matchedEvents.filter(
        (e) => e.ticket.status !== "sold-out" && e.ticket.status !== "closed"
      );
      if (available.length > 0) {
        return {
          role: "assistant",
          content: `I found ${available.length} events with tickets available. Click any event card to see full booking details and step-by-step guide:`,
          eventSuggestions: available.slice(0, 5),
        };
      }
      return {
        role: "assistant",
        content: "Unfortunately, all matching events are either sold out or registration has closed.",
        eventSuggestions: matchedEvents.slice(0, 3),
      };
    }

    // Generic ticket question
    const availableEvents = events.filter(
      (e) => e.ticket.status !== "sold-out" && e.ticket.status !== "closed"
    );
    return {
      role: "assistant",
      content: `There are **${availableEvents.length} events** with tickets currently available. Which type are you interested in? Try asking about a specific event like *"Coldplay tickets"* or a category like *"tech event tickets"*.`,
    };
  }

  // Free events
  if (matchesKeywords(q, ["free", "no cost", "complimentary", "zero cost"])) {
    const freeEvents = events.filter(
      (e) => e.ticket.status === "free" || e.ticket.price?.toLowerCase().includes("free")
    );
    if (freeEvents.length > 0) {
      return {
        role: "assistant",
        content: `Great news! There are **${freeEvents.length} free events** in Delhi NCR:`,
        eventSuggestions: freeEvents,
      };
    }
    return { role: "assistant", content: "There are no free events currently listed. Check back soon!" };
  }

  // Recommendations by interest
  if (matchesKeywords(q, ["recommend", "suggest", "best", "top", "popular", "trending"])) {
    if (matchesKeywords(q, ["developer", "dev", "coding", "programming", "tech", "ai", "software", "engineer"])) {
      const techEvents = events.filter((e) => e.category === "tech-ai" && e.ticket.status !== "sold-out" && e.ticket.status !== "closed");
      return {
        role: "assistant",
        content: "Here are my top picks for tech/developer events in Delhi NCR:",
        eventSuggestions: techEvents.slice(0, 5),
      };
    }
    if (matchesKeywords(q, ["music", "concert", "fun", "entertainment", "party", "weekend"])) {
      const funEvents = events.filter((e) => e.category === "entertainment" && e.ticket.status !== "sold-out");
      return {
        role: "assistant",
        content: "Here are the best entertainment events coming up:",
        eventSuggestions: funEvents.slice(0, 5),
      };
    }
    if (matchesKeywords(q, ["finance", "invest", "money", "trading", "fintech", "banking"])) {
      const finEvents = events.filter((e) => e.category === "finance");
      return {
        role: "assistant",
        content: "Here are the top finance events for you:",
        eventSuggestions: finEvents.slice(0, 5),
      };
    }
    // General recommendation
    const featured = events.filter((e) => e.featured);
    return {
      role: "assistant",
      content: "Here are my top recommended events — these are the featured picks:",
      eventSuggestions: featured,
    };
  }

  // This week / month / date-based
  if (matchesKeywords(q, ["this week", "next week", "today", "tomorrow", "this month", "june", "july", "august"])) {
    const now = new Date();
    let filtered: Event[];

    if (q.includes("today")) {
      const todayStr = format(now, "yyyy-MM-dd");
      filtered = events.filter((e) => e.date === todayStr);
    } else if (q.includes("tomorrow")) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = events.filter((e) => e.date === format(tomorrow, "yyyy-MM-dd"));
    } else if (q.includes("this week")) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filtered = events.filter((e) => {
        const d = new Date(e.date);
        return d >= now && d <= weekEnd;
      });
    } else if (q.includes("next week")) {
      const nextWeekStart = new Date(now);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
      filtered = events.filter((e) => {
        const d = new Date(e.date);
        return d >= nextWeekStart && d <= nextWeekEnd;
      });
    } else {
      // Month match
      const monthMap: Record<string, number> = { june: 5, july: 6, august: 7 };
      const month = Object.keys(monthMap).find((m) => q.includes(m));
      if (month) {
        filtered = events.filter((e) => new Date(e.date).getMonth() === monthMap[month]);
      } else {
        filtered = events;
      }
    }

    if (filtered.length === 0) {
      return { role: "assistant", content: "No events found for that time period. Try a broader search!" };
    }
    return {
      role: "assistant",
      content: `Found **${filtered.length} event${filtered.length > 1 ? "s" : ""}** for that period:`,
      eventSuggestions: filtered.slice(0, 6),
    };
  }

  // Category search
  for (const [key, meta] of Object.entries(CATEGORY_META)) {
    if (q.includes(key) || q.includes(meta.label.toLowerCase())) {
      const categoryEvents = events.filter((e) => e.category === key);
      if (categoryEvents.length > 0) {
        return {
          role: "assistant",
          content: `Here are all **${meta.label}** events in Delhi NCR:`,
          eventSuggestions: categoryEvents,
        };
      }
    }
  }

  // Area search
  const areas = ["delhi", "gurugram", "gurgaon", "noida", "faridabad", "ghaziabad"];
  for (const area of areas) {
    if (q.includes(area)) {
      const areaName = area === "gurgaon" ? "Gurugram" : area.charAt(0).toUpperCase() + area.slice(1);
      const searchArea = area === "gurgaon" ? "gurugram" : area;
      const areaEvents = events.filter((e) => e.area.toLowerCase().includes(searchArea));
      if (areaEvents.length > 0) {
        return {
          role: "assistant",
          content: `Here are events in **${areaName}**:`,
          eventSuggestions: areaEvents,
        };
      }
      return { role: "assistant", content: `No events currently listed in ${areaName}.` };
    }
  }

  // General search fallback
  const searchResults = findEventsForQuery(q, events);
  if (searchResults.length > 0) {
    return {
      role: "assistant",
      content: `I found ${searchResults.length} event${searchResults.length > 1 ? "s" : ""} matching your query:`,
      eventSuggestions: searchResults.slice(0, 5),
    };
  }

  // Complete fallback
  return {
    role: "assistant",
    content:
      "I couldn't find a specific match. Here are some things you can try:\n\n" +
      "• **\"Show me tech events\"** — browse by category\n" +
      "• **\"Events in Gurugram\"** — filter by area\n" +
      "• **\"How to book Coldplay tickets?\"** — get booking help\n" +
      "• **\"Free events this month\"** — find free events\n" +
      "• **\"Recommend events for a developer\"** — get personalized picks",
  };
}
