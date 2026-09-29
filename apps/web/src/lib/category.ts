import { EventCategory } from "@olive/types";

export const CATEGORY_TABS: { label: string; category?: EventCategory }[] = [
  { label: "All Programs" },
  { label: "Vigils", category: "VIGIL" },
  { label: "Miracle & Communion", category: "COMMUNION" },
  { label: "Revival Nights", category: "REVIVAL" },
  { label: "Worship", category: "WORSHIP" },
  { label: "Conferences", category: "CONFERENCE" },
  { label: "Outreach", category: "OUTREACH" },
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  GENERAL: "General",
  CONFERENCE: "Conference",
  VIGIL: "Vigil",
  COMMUNION: "Communion",
  REVIVAL: "Revival",
  WORSHIP: "Worship",
  OUTREACH: "Outreach",
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  GENERAL: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  CONFERENCE: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  VIGIL: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  COMMUNION: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  REVIVAL: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  WORSHIP: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  OUTREACH: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};
