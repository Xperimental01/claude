export type EventCategory =
  | "tech-ai"
  | "finance"
  | "consulting"
  | "entertainment"
  | "knowledge"
  | "networking"
  | "other";

export interface EventTicket {
  available: boolean;
  price?: string;
  link?: string;
  platform?: string;
}

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
}

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  "tech-ai": {
    label: "Tech & AI",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "🤖",
  },
  finance: {
    label: "Finance",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "💹",
  },
  consulting: {
    label: "Consulting",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: "📊",
  },
  entertainment: {
    label: "Entertainment",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "🎵",
  },
  knowledge: {
    label: "Knowledge",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "📚",
  },
  networking: {
    label: "Networking",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    icon: "🤝",
  },
  other: {
    label: "Other",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: "📌",
  },
};
