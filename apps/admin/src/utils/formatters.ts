import { truncateString } from "@/helpers/truncateString";
import { capitalizeWords } from "@/helpers/capitalizeWords";
import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter";

export { truncateString, capitalizeWords, capitalizeFirstLetter };

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
 */
export function formatDateTimeInput(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a raw date string into a clean human-readable date representation.
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
