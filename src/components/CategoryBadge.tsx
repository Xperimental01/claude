"use client";
import { EventCategory, CATEGORY_META } from "@/types/event";

export default function CategoryBadge({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}
    >
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
