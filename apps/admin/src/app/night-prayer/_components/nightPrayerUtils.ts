import * as yup from "yup";
import { MAX_REMINDER_OFFSETS, MEET_URL_PATTERN } from "@/models/night-prayer";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const nightPrayerSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .max(150, "Title can be at most 150 characters"),
  description: yup.string().default(""),
  imageUrl: yup.string().default(""),
  meetUrl: yup
    .string()
    .trim()
    .required("Google Meet link is required")
    .matches(
      MEET_URL_PATTERN,
      "Use a Google Meet link, e.g. https://meet.google.com/abc-defg-hij",
    ),
  timeOfDay: yup
    .string()
    .required("Start time is required")
    .matches(TIME_RE, "Use the format HH:mm"),
  durationMin: yup
    .number()
    .typeError("Enter a number")
    .integer("Must be a whole number")
    .min(15, "At least 15 minutes")
    .max(240, "At most 240 minutes")
    .required("Duration is required"),
  joinOpensMinBefore: yup
    .number()
    .typeError("Enter a number")
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(60, "At most 60 minutes")
    .required("Join gate time is required"),
  daysOfWeek: yup
    .array()
    .of(yup.number().required())
    .required()
    .default([])
    .when("isActive", {
      is: true,
      then: (s) => s.min(1, "Pick at least one day while this is active"),
    }),
  reminderOffsetsMin: yup
    .array()
    .of(
      yup
        .number()
        .typeError("Enter a number")
        .integer("Whole minutes only")
        .min(5, "At least 5 minutes")
        .max(720, "At most 720 minutes")
        .required("Enter a number"),
    )
    .required()
    .max(MAX_REMINDER_OFFSETS, `At most ${MAX_REMINDER_OFFSETS} reminders`)
    .default([]),
  isActive: yup.boolean().required().default(true),
});

export type NightPrayerFormValues = yup.InferType<typeof nightPrayerSchema>;

/** "22:00" -> "10:00 PM" */
export function formatClock(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m[2]} ${suffix}`;
}

function shiftClock(hhmm: string, deltaMin: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m + deltaMin) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function describeOffset(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts = [
    h > 0 ? `${h} hour${h === 1 ? "" : "s"}` : "",
    m > 0 ? `${m} minute${m === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

export interface ScheduledAlert {
  time: string;
  kind: "reminder" | "on-time";
  text: string;
}

/** Every push the current settings will generate, earliest first. */
export function calculateNotificationSchedule(
  timeOfDay: string,
  reminderOffsetsMin: number[],
): ScheduledAlert[] {
  if (!TIME_RE.test(timeOfDay)) return [];
  const valid = [...new Set(reminderOffsetsMin)]
    .filter((n) => Number.isFinite(n) && n >= 5 && n <= 720)
    .sort((a, b) => b - a);
  return [
    ...valid.map<ScheduledAlert>((offset) => ({
      time: formatClock(shiftClock(timeOfDay, -offset)),
      kind: "reminder",
      text: `Night Prayer in ${describeOffset(offset)}`,
    })),
    {
      time: formatClock(timeOfDay),
      kind: "on-time",
      text: "Night Prayer is starting — Tap to join",
    },
  ];
}
