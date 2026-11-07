"use client";

import React, { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ImagePlus, Plus, X } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { DayChips } from "@/components/ui/DayChips";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUploadFlyer } from "@/hooks/useUploads";
import {
  MAX_REMINDER_OFFSETS,
  NightPrayerConfig,
  NightPrayerPayload,
} from "@/models/night-prayer";
import { NightPrayerFormValues, nightPrayerSchema } from "./nightPrayerUtils";
import { NotificationPreview } from "./NotificationPreview";

interface Props {
  config: NightPrayerConfig | null;
  onSave: (payload: NightPrayerPayload) => Promise<unknown>;
}

const toDefaults = (c: NightPrayerConfig | null): NightPrayerFormValues => ({
  title: c?.title ?? "Night Prayer",
  description: c?.description ?? "",
  imageUrl: c?.imageUrl ?? "",
  meetUrl: c?.meetUrl ?? "",
  timeOfDay: c?.timeOfDay ?? "22:00",
  durationMin: c?.durationMin ?? 60,
  joinOpensMinBefore: c?.joinOpensMinBefore ?? 10,
  daysOfWeek: c?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
  reminderOffsetsMin: c?.reminderOffsetsMin ?? [],
  isActive: c?.isActive ?? true,
});

export const NightPrayerForm: React.FC<Props> = ({ config, onSave }) => {
  const { control, handleSubmit, reset, setValue, formState } =
    useForm<NightPrayerFormValues>({
      resolver: yupResolver(nightPrayerSchema),
      mode: "onTouched",
      defaultValues: toDefaults(config),
    });
  const { uploadFlyer, isUploadingFlyer } = useUploadFlyer();
  const fileRef = useRef<HTMLInputElement>(null);

  const [timeOfDay, offsets, isActive, imageUrl] = useWatch({
    control,
    name: ["timeOfDay", "reminderOffsetsMin", "isActive", "imageUrl"],
  });

  const pickImage = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadFlyer(file);
      setValue("imageUrl", url, { shouldDirty: true });
    } catch {
      // API errors are toasted by the API client.
    }
  };

  const submit = handleSubmit(async (v) => {
    const payload: NightPrayerPayload = {
      title: v.title.trim(),
      description: v.description?.trim() || undefined,
      imageUrl: v.imageUrl || undefined,
      meetUrl: v.meetUrl.trim(),
      timeOfDay: v.timeOfDay,
      durationMin: v.durationMin,
      joinOpensMinBefore: v.joinOpensMinBefore,
      daysOfWeek: v.daysOfWeek,
      reminderOffsetsMin: [...new Set(v.reminderOffsetsMin)].sort(
        (a, b) => b - a,
      ),
      isActive: v.isActive,
    };
    try {
      await onSave(payload);
      reset(v);
    } catch {
      // API errors are toasted by the API client; keep the form as is.
    }
  });

  return (
    <form
      noValidate
      onSubmit={submit}
      className="grid grid-cols-1 gap-6 lg:grid-cols-5"
      aria-label="Night prayer settings"
    >
      <Card className="space-y-5 p-5 lg:col-span-3">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              color="emerald"
              label={field.value ? "Active" : "Inactive"}
              description={
                field.value
                  ? "Members can join and receive reminders."
                  : "Night Prayer is hidden and no pushes are sent."
              }
            />
          )}
        />

        <Controller
          name="title"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Title"
              required
              maxLength={150}
              error={error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              value={field.value ?? ""}
              label="Description"
              rows={3}
              placeholder="Join us every night as we end the day in prayer."
              error={error?.message}
            />
          )}
        />

        <div className="space-y-1.5">
          <p className="text-xs font-bold text-fg">Image</p>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Night prayer"
                className="h-16 w-24 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-border text-fg-subtle">
                <ImagePlus className="h-5 w-5" aria-hidden />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                void pickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isUploadingFlyer}
              onClick={() => fileRef.current?.click()}
            >
              {imageUrl ? "Replace" : "Upload"}
            </Button>
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("imageUrl", "", { shouldDirty: true })}
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <Controller
          name="meetUrl"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="url"
              label="Google Meet link"
              required
              placeholder="https://meet.google.com/abc-defg-hij"
              error={error?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Controller
            name="timeOfDay"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                type="time"
                label="Start time"
                required
                error={error?.message}
                hint="Africa/Lagos"
              />
            )}
          />
          <Controller
            name="durationMin"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                type="number"
                min={15}
                max={240}
                label="Duration (min)"
                required
                error={error?.message}
              />
            )}
          />
          <Controller
            name="joinOpensMinBefore"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                type="number"
                min={0}
                max={60}
                label="Join opens (min before)"
                required
                error={error?.message}
              />
            )}
          />
        </div>

        <Controller
          name="daysOfWeek"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DayChips
              label="Days"
              value={field.value}
              onChange={(d) => {
                field.onChange(d);
                field.onBlur();
              }}
              error={error?.message}
            />
          )}
        />

        <Controller
          name="reminderOffsetsMin"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const list = field.value;
            const itemErrors = Array.isArray(error)
              ? (error as ({ message?: string } | undefined)[])
              : [];
            return (
              <div className="space-y-2">
                <p className="text-xs font-bold text-fg">
                  Reminders before start
                </p>
                {list.map((n, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Input
                      type="number"
                      min={5}
                      max={720}
                      aria-label={`Reminder ${i + 1} minutes before`}
                      value={Number.isNaN(n) ? "" : n}
                      onChange={(e) => {
                        const next = [...list];
                        next[i] =
                          e.target.value === "" ? NaN : Number(e.target.value);
                        field.onChange(next);
                      }}
                      onBlur={field.onBlur}
                      error={itemErrors[i]?.message}
                      hint="minutes before start"
                      containerClassName="w-48"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove reminder ${i + 1}`}
                      onClick={() =>
                        field.onChange(list.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {!Array.isArray(error) && error?.message && (
                  <p className="text-xs text-danger-text">{error.message}</p>
                )}
                {list.length < MAX_REMINDER_OFFSETS && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => field.onChange([...list, 60])}
                  >
                    Add reminder
                  </Button>
                )}
              </div>
            );
          }}
        />
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <NotificationPreview
          timeOfDay={timeOfDay}
          reminderOffsetsMin={offsets}
          isActive={isActive}
        />
        <Card>
          <CardHeader>
            <CardTitle>Save changes</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-3 p-5 pt-0">
            <Button
              type="submit"
              loading={formState.isSubmitting}
              disabled={isUploadingFlyer || !formState.isDirty}
            >
              Save settings
            </Button>
            {formState.isDirty && (
              <span className="text-xs text-warning-text">Unsaved changes</span>
            )}
          </div>
        </Card>
      </div>
    </form>
  );
};
