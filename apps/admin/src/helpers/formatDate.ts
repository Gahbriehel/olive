import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface Props {
  date: string;
  showTime?: boolean;
  utc?: boolean;
}

export function formatDate({
  date,
  showTime = true,
  utc = false,
}: Props): string {
  if (!date) return "";
  if (utc) {
    return showTime
      ? dayjs(date).utc().format("MMM DD, YYYY hh:mmA")
      : dayjs(date).utc().format("MMM DD, YYYY");
  }

  return showTime
    ? dayjs(date).format("MMM DD, YYYY hh:mmA")
    : dayjs(date).format("MMM DD, YYYY");
}

export function formatDateToInputType(date: string): string {
  return dayjs(date).utc().format("YYYY-MM-DD");
}

/**
 * Formats a birthday date and its relative countdown for display badges.
 * - daysUntil === 0 => "🎉 Today!"
 * - daysUntil === 1 => "Tomorrow"
 * - daysUntil > 1   => "In X days (Oct 15)"
 */
export function formatBirthdayDate(isoDate: string, daysUntil: number): string {
  if (daysUntil === 0) return "🎉 Today!";
  if (daysUntil === 1) return "Tomorrow";
  const formatted = isoDate ? dayjs(isoDate).format("MMM D") : "";
  return formatted
    ? `In ${daysUntil} days (${formatted})`
    : `In ${daysUntil} days`;
}
