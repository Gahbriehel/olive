export interface NightPrayerConfig {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  meetUrl: string;
  /** "HH:mm" in Africa/Lagos. */
  timeOfDay: string;
  durationMin: number;
  joinOpensMinBefore: number;
  /** 0 = Sun .. 6 = Sat. */
  daysOfWeek: number[];
  reminderOffsetsMin: number[];
  isActive: boolean;
}

export type NightPrayerPayload = NightPrayerConfig;

export interface NightPrayerException {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  cancelled: boolean;
  note?: string | null;
}

export interface CreateNightPrayerExceptionPayload {
  date: string;
  cancelled: boolean;
  note?: string;
}

export const MEET_URL_PATTERN = /^https:\/\/meet\.google\.com\/[a-z0-9-]+/;
export const MAX_REMINDER_OFFSETS = 3;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
