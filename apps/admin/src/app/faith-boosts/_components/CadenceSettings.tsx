"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotificationSettings } from "@/hooks/useNotifications";
import {
  EncouragementSlot,
  MAX_ENCOURAGEMENT_SLOTS,
  NotificationSettings,
} from "@/models/notifications";
import { DAY_LABELS } from "@/models/night-prayer";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const Form: React.FC<{
  initial: NotificationSettings;
  onSave: (s: NotificationSettings) => Promise<unknown>;
  saving: boolean;
}> = ({ initial, onSave, saving }) => {
  const [sendTime, setSendTime] = useState(initial.scriptureSendTime);
  const [slots, setSlots] = useState<EncouragementSlot[]>(
    initial.encouragementSlots,
  );
  const [showErrors, setShowErrors] = useState(false);

  const timeBad = !TIME_RE.test(sendTime);
  const slotBad = (s: EncouragementSlot) => !TIME_RE.test(s.time);
  const invalid = timeBad || slots.some(slotBad);

  const dirty =
    sendTime !== initial.scriptureSendTime ||
    JSON.stringify(slots) !== JSON.stringify(initial.encouragementSlots);

  const patch = (i: number, p: Partial<EncouragementSlot>) =>
    setSlots((l) => l.map((s, j) => (j === i ? { ...s, ...p } : s)));

  const save = async () => {
    if (invalid) {
      setShowErrors(true);
      return;
    }
    try {
      await onSave({ scriptureSendTime: sendTime, encouragementSlots: slots });
      setShowErrors(false);
    } catch {
      // API errors are toasted by the API client.
    }
  };

  return (
    <div className="space-y-6 p-5 pt-2">
      <Input
        type="time"
        label="Scripture send time"
        value={sendTime}
        onChange={(e) => setSendTime(e.target.value)}
        error={showErrors && timeBad ? "Choose a time" : undefined}
        hint="When the scripture push goes out on its start date (Africa/Lagos)."
        containerClassName="max-w-xs"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-fg">
            Encouragement delivery slots ({slots.length}/
            {MAX_ENCOURAGEMENT_SLOTS})
          </p>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={slots.length >= MAX_ENCOURAGEMENT_SLOTS}
            onClick={() => setSlots((l) => [...l, { day: 2, time: "12:30" }])}
          >
            Add slot
          </Button>
        </div>
        {slots.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-fg-muted">
            No slots. Members won&apos;t receive encouragement pushes.
          </p>
        )}
        {slots.map((s, i) => (
          <div key={i} className="flex flex-wrap items-start gap-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`slot-day-${i}`}
                className="sr-only"
              >{`Slot ${i + 1} day`}</label>
              <select
                id={`slot-day-${i}`}
                value={s.day}
                onChange={(e) => patch(i, { day: Number(e.target.value) })}
                className="h-10 rounded-xl border border-border-control bg-surface px-3 text-sm text-fg"
              >
                {DAY_LABELS.map((d, n) => (
                  <option key={d} value={n}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="time"
              aria-label={`Slot ${i + 1} time`}
              value={s.time}
              onChange={(e) => patch(i, { time: e.target.value })}
              error={showErrors && slotBad(s) ? "Choose a time" : undefined}
              containerClassName="w-40"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove slot ${i + 1}`}
              onClick={() => setSlots((l) => l.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button loading={saving} disabled={!dirty} onClick={save}>
        Save settings
      </Button>
    </div>
  );
};

export const CadenceSettings: React.FC = () => {
  const { settings, isLoading, isError, refetch, saveSettings, isSaving } =
    useNotificationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send times</CardTitle>
        <CardDescription>
          When scripture and encouragement pushes go out. All times are
          Africa/Lagos.
        </CardDescription>
      </CardHeader>
      {isLoading ? (
        <div className="p-5">
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !settings ? (
        <p className="p-5 text-sm text-fg-muted">
          Couldn&apos;t load settings.{" "}
          <button
            type="button"
            className="font-semibold text-primary-text underline"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </p>
      ) : (
        <Form
          // Re-seed after a successful save.
          key={JSON.stringify(settings)}
          initial={settings}
          onSave={saveSettings}
          saving={isSaving}
        />
      )}
    </Card>
  );
};
