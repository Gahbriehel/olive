import {
  ConfessionReminder,
  ConfessionReminderInput,
  MAX_CONFESSION_REMINDERS,
  REMINDER_MESSAGE_MAX,
} from "@/models/confession";

/** Editable row. `key` is client-only, for stable React keys. */
export interface ReminderDraft {
  key: string;
  timeOfDay: string;
  daysOfWeek: number[];
  startsOn: string;
  endsOn: string;
  message: string;
}

export type ReminderErrors = Partial<
  Record<"timeOfDay" | "endsOn" | "message", string>
>;

let counter = 0;
export const newReminderKey = () => `r${Date.now()}-${counter++}`;

export const emptyReminder = (): ReminderDraft => ({
  key: newReminderKey(),
  timeOfDay: "06:30",
  daysOfWeek: [],
  startsOn: "",
  endsOn: "",
  message: "",
});

export const toDrafts = (list: ConfessionReminder[]): ReminderDraft[] =>
  list.map((r) => ({
    key: r.id ?? newReminderKey(),
    timeOfDay: r.timeOfDay,
    daysOfWeek: [...(r.daysOfWeek ?? [])].sort((a, b) => a - b),
    startsOn: r.startsOn?.slice(0, 10) ?? "",
    endsOn: r.endsOn?.slice(0, 10) ?? "",
    message: r.message ?? "",
  }));

export const toInputs = (drafts: ReminderDraft[]): ConfessionReminderInput[] =>
  drafts.map((d) => ({
    timeOfDay: d.timeOfDay,
    daysOfWeek: d.daysOfWeek,
    ...(d.startsOn ? { startsOn: d.startsOn } : {}),
    ...(d.endsOn ? { endsOn: d.endsOn } : {}),
    ...(d.message.trim() ? { message: d.message.trim() } : {}),
  }));

/** Stable string for dirty checks (ignores the client-only key). */
export const serialize = (drafts: ReminderDraft[]) =>
  JSON.stringify(toInputs(drafts));

export function validateReminders(
  drafts: ReminderDraft[],
): Record<string, ReminderErrors> {
  const out: Record<string, ReminderErrors> = {};
  for (const d of drafts) {
    const e: ReminderErrors = {};
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.timeOfDay)) {
      e.timeOfDay = "Choose a time";
    }
    if (d.startsOn && d.endsOn && d.endsOn < d.startsOn) {
      e.endsOn = "End date must be on or after the start date";
    }
    if (d.message.length > REMINDER_MESSAGE_MAX) {
      e.message = `At most ${REMINDER_MESSAGE_MAX} characters`;
    }
    if (Object.keys(e).length) out[d.key] = e;
  }
  return out;
}

export { MAX_CONFESSION_REMINDERS, REMINDER_MESSAGE_MAX };
