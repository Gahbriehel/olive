"use client";

import React from "react";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Button } from "@/components/ui/Button";
import { DayChips } from "@/components/ui/DayChips";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  MAX_CONFESSION_REMINDERS,
  REMINDER_MESSAGE_MAX,
  ReminderDraft,
  ReminderErrors,
  emptyReminder,
} from "./reminderUtils";

interface Props {
  drafts: ReminderDraft[] | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  errors: Record<string, ReminderErrors>;
  onChange: (drafts: ReminderDraft[]) => void;
}

/** Up to six push reminder times for one confession. Saved with the confession. */
export const RemindersPanel: React.FC<Props> = ({
  drafts,
  isLoading,
  isError,
  onRetry,
  errors,
  onChange,
}) => {
  const patch = (key: string, p: Partial<ReminderDraft>) =>
    onChange((drafts ?? []).map((d) => (d.key === key ? { ...d, ...p } : d)));

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-4 w-4" aria-hidden /> Reminders
          </CardTitle>
          <CardDescription>
            Push members to read or listen at these times (Africa/Lagos). Saved
            with the confession.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Plus className="h-4 w-4" />}
          disabled={!drafts || drafts.length >= MAX_CONFESSION_REMINDERS}
          onClick={() => onChange([...(drafts ?? []), emptyReminder()])}
        >
          Add reminder
        </Button>
      </CardHeader>

      <div className="space-y-4 p-5 pt-2">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isError || !drafts ? (
          <p className="text-sm text-fg-muted">
            Couldn&apos;t load reminders.{" "}
            <button
              type="button"
              className="font-semibold text-primary-text underline"
              onClick={onRetry}
            >
              Try again
            </button>
          </p>
        ) : drafts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-fg-muted">
            No reminders. Add one to push members about this confession.
          </p>
        ) : (
          drafts.map((d, i) => {
            const e = errors[d.key] ?? {};
            return (
              <div
                key={d.key}
                className="space-y-4 rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold text-fg">Reminder {i + 1}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove reminder ${i + 1}`}
                    onClick={() =>
                      onChange(drafts.filter((x) => x.key !== d.key))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    type="time"
                    label="Time"
                    required
                    value={d.timeOfDay}
                    error={e.timeOfDay}
                    onChange={(ev) =>
                      patch(d.key, { timeOfDay: ev.target.value })
                    }
                  />
                  <Input
                    type="date"
                    label="Starts on"
                    value={d.startsOn}
                    hint="Optional"
                    onChange={(ev) =>
                      patch(d.key, { startsOn: ev.target.value })
                    }
                  />
                  <Input
                    type="date"
                    label="Ends on"
                    value={d.endsOn}
                    min={d.startsOn || undefined}
                    error={e.endsOn}
                    hint={e.endsOn ? undefined : "Optional"}
                    onChange={(ev) => patch(d.key, { endsOn: ev.target.value })}
                  />
                </div>

                <DayChips
                  label="Days"
                  value={d.daysOfWeek}
                  emptyLabel="Every day"
                  onChange={(days) => patch(d.key, { daysOfWeek: days })}
                />

                <Input
                  label="Custom push message"
                  value={d.message}
                  placeholder="Leave empty to use confession reference or excerpt."
                  error={e.message}
                  labelSuffix={
                    <span className="ml-auto font-mono text-2xs text-fg-muted">
                      {d.message.length} / {REMINDER_MESSAGE_MAX}
                    </span>
                  }
                  onChange={(ev) => patch(d.key, { message: ev.target.value })}
                />
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
