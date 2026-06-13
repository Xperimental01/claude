export type EventCategory =
  | "tech-ai"
  | "finance"
  | "consulting"
  | "entertainment"
  | "knowledge"
  | "networking"
  | "other";

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
