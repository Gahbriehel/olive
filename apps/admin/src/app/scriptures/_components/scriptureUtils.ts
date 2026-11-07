import { EVENT_TIMEZONE } from "@/utils/formatters";
import { Scripture, ScriptureKind } from "@/models/scripture";

export const TRANSLATION_STORAGE_KEY = "olive.scripture.translation";
export const DEFAULT_TRANSLATION = "NKJV";

/** Today's calendar date in the church timezone, as "YYYY-MM-DD". */
export function todayInLagos(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The coming Monday ("YYYY-MM-DD"), or today when today is Monday. */
export function nextMondayInLagos(today: string = todayInLagos()): string {
  const d = new Date(`${today}T00:00:00Z`);
  const daysAhead = (8 - d.getUTCDay()) % 7; // Sunday=0 -> 1, Monday=1 -> 0
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export function defaultStartsOn(kind: ScriptureKind): string {
  const today = todayInLagos();
  return kind === "YEAR" ? today : nextMondayInLagos(today);
}

/** Formats a "YYYY-MM-DD" calendar date without any timezone shifting. */
export function formatCalendarDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function readRememberedTranslation(): string {
  try {
    return (
      window.localStorage.getItem(TRANSLATION_STORAGE_KEY) ??
      DEFAULT_TRANSLATION
    );
  } catch {
    return DEFAULT_TRANSLATION;
  }
}

export function rememberTranslation(value: string): void {
  try {
    window.localStorage.setItem(TRANSLATION_STORAGE_KEY, value);
  } catch {
    // Storage can be blocked; the default simply applies next time.
  }
}

export interface ScriptureGroups {
  live: Scripture | null;
  scheduled: Scripture[];
  pastAndDrafts: Scripture[];
}

const newestFirst = (a: Scripture, b: Scripture) =>
  b.startsOn.localeCompare(a.startsOn) ||
  b.createdAt.localeCompare(a.createdAt);

export function groupScriptures(
  items: Scripture[],
  today: string = todayInLagos(),
): ScriptureGroups {
  const live = items.find((s) => s.isCurrent) ?? null;
  const rest = items.filter((s) => !s.isCurrent);
  return {
    live,
    scheduled: rest
      .filter((s) => s.status === "PUBLISHED" && s.startsOn > today)
      .sort((a, b) => a.startsOn.localeCompare(b.startsOn)),
    pastAndDrafts: rest
      .filter((s) => !(s.status === "PUBLISHED" && s.startsOn > today))
      .sort(newestFirst),
  };
}

/**
 * Whether saving `next` as published would take over from the live scripture.
 * Mirrors Dove's rule: latest `startsOn` wins, newest `createdAt` breaks ties
 * (a record being created is always the newest).
 */
export function wouldReplaceLive(
  live: Scripture | null,
  next: { id?: string; startsOn: string; status: string; createdAt?: string },
  today: string = todayInLagos(),
): boolean {
  if (!live || next.status !== "PUBLISHED" || next.startsOn > today) {
    return false;
  }
  if (live.id === next.id) return false;
  if (next.startsOn !== live.startsOn) return next.startsOn > live.startsOn;
  return (next.createdAt ?? "9999") > live.createdAt;
}
