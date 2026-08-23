import { truncateString } from "@/helpers/truncateString";
import { capitalizeWords } from "@/helpers/capitalizeWords";
import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter";

export { truncateString, capitalizeWords, capitalizeFirstLetter };

export const EVENT_TIMEZONE = "Africa/Lagos"; // GMT+1

/**
 * Extracts and formats the uppercase initials from a full name.
 * e.g., "Gabriel Oak" => "GO", "John" => "J"
 */
export function getInitials(name = ""): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats an ISO or Date string for HTML5 datetime-local input controls (YYYY-MM-DDTHH:mm).
 * Consistently converts to Africa/Lagos (GMT+1) local wall-clock representation.
 */
export function formatDateTimeInput(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: EVENT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(d);
    const partMap: Record<string, string> = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    const hour = partMap.hour === "24" ? "00" : partMap.hour.padStart(2, "0");
    return `${partMap.year}-${partMap.month.padStart(2, "0")}-${partMap.day.padStart(2, "0")}T${hour}:${partMap.minute.padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

/**
 * Converts a datetime input string (e.g. "2026-08-25T10:00") into a UTC ISO 8601 string,
 * explicitly interpreting naive local strings in Africa/Lagos (GMT+1) timezone (+01:00).
 */
export function toISOInEventTimezone(dateTimeStr?: string): string {
  if (!dateTimeStr) return "";
  // If already contains Z or explicit timezone offset (+01:00, -05:00, etc.), convert directly to ISO string
  if (dateTimeStr.includes("Z") || /[+-]\d{2}:\d{2}$/.test(dateTimeStr)) {
    return new Date(dateTimeStr).toISOString();
  }
  // Otherwise, it's a naive local datetime string from <input type="datetime-local"> (e.g. "2026-08-25T10:00")
  const formatted = dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
  return new Date(`${formatted}+01:00`).toISOString();
}

/**
 * Formats a raw date string into a clean human-readable date representation in Africa/Lagos timezone.
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      timeZone: EVENT_TIMEZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a raw date string into a clean human-readable date & time representation in Africa/Lagos timezone.
 */
export function formatDateTimeDisplay(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      timeZone: EVENT_TIMEZONE,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

