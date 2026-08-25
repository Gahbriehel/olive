"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "@headlessui/react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";
import { uploadsService } from "@/services/uploads.service";
import { formatDateTimeInput, toISOInEventTimezone } from "@/utils/formatters";

export type EventStatusEnum = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export interface EventFormValues {
  title: string;
  description?: string;
  location?: string;
  capacity?: number;
  startDate: string;
  endDate: string;
  status: EventStatusEnum;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

interface EventsFormProps {
  initialValues?: Partial<EventFormValues> & { id?: string };
  onSubmit: (data: EventFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const STATUS_OPTIONS: ISelect[] = [
  { value: { _id: "DRAFT" }, label: "DRAFT" },
  { value: { _id: "PUBLISHED" }, label: "PUBLISHED" },
  { value: { _id: "COMPLETED" }, label: "COMPLETED" },
  { value: { _id: "CANCELLED" }, label: "CANCELLED" },
];

export const EventsForm: React.FC<EventsFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
}) => {
  const isEditing = Boolean(initialValues?.id || onDelete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { control, handleSubmit, watch, setValue, formState } =
    useForm<EventFormValues>({
      defaultValues: {
        title: initialValues?.title || "",
        description: initialValues?.description || "",
        location: initialValues?.location || "",
        capacity: initialValues?.capacity || 0,
        startDate: formatDateTimeInput(initialValues?.startDate) || "",
        endDate: formatDateTimeInput(initialValues?.endDate) || "",
        status: initialValues?.status || "DRAFT",
        imageUrl: initialValues?.imageUrl || "",
        googleCalendarSync: initialValues?.googleCalendarSync ?? false,
      },
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDateValue = watch("startDate");
  const imageUrlValue = watch("imageUrl");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const uploadedUrl = await uploadsService.uploadFlyer(file);
      setValue("imageUrl", uploadedUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Toast handled by api client interceptor
    } finally {
      setIsUploading(false);
    }
  };

  const onFormSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        startDate: toISOInEventTimezone(data.startDate),
        endDate: toISOInEventTimezone(data.endDate),
        capacity: data.capacity ? Number(data.capacity) : 0,
        status: data.status || "DRAFT",
        googleCalendarSync: Boolean(data.googleCalendarSync),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeletingState(true);
      await onDelete();
    } finally {
      setIsDeletingState(false);
    }
  };

  const isPending = isLoading || isSubmitting || formState.isSubmitting;
  const isDeletingPending = isDeleting || isDeletingState;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col h-full space-y-5 p-1"
    >
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Title */}
        <Controller
          name="title"
          control={control}
          rules={{ required: "Event title is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Event Title"
              placeholder="e.g. Annual Youth Conference 2026"
              required
              error={error?.message}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Description"
              placeholder="Enter event description (supports multi-line paragraphs and lists)..."
              error={error?.message}
              rows={5}
            />
          )}
        />

        {/* Location */}
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Location"
              placeholder="e.g. Main Auditorium"
              error={error?.message}
            />
          )}
        />

        <Controller
          name="capacity"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Capacity"
              type="number"
              placeholder="e.g. 100"
              error={error?.message}
            />
          )}
        />

        {/* Start Date */}
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="datetime-local"
              label="Start Date & Time"
              required
              error={error?.message}
            />
          )}
        />

        {/* End Date */}
        <Controller
          name="endDate"
          control={control}
          rules={{
            required: "End date is required",
            validate: (val) => {
              if (startDateValue && new Date(val) < new Date(startDateValue)) {
                return "End date must be after start date";
              }
              return true;
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="datetime-local"
              label="End Date & Time"
              required
              error={error?.message}
            />
          )}
        />

        {/* Event Flyer Image Upload & URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
            Event Flyer Image
          </label>
          <div className="space-y-2">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  placeholder="https://... or upload flyer image"
                  error={error?.message}
                />
              )}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-500" />
                )}
                <span>
                  {isUploading ? "Uploading..." : "Upload Image File"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                Max 3MB (JPEG, PNG, WEBP)
              </span>
            </div>
            {imageUrlValue && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrlValue}
                  alt="Flyer Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Google Calendar Sync Switch */}
        <Controller
          name="googleCalendarSync"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div className="pr-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Google Calendar Sync
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow attendees to automatically sync event details & receive
                  .ics calendar invites
                </p>
              </div>
              <Switch
                checked={Boolean(value)}
                onChange={onChange}
                className={`${
                  value ? "bg-emerald-600" : "bg-slate-300 dark:bg-zinc-600"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <span className="sr-only">Enable Google Calendar Sync</span>
                <span
                  aria-hidden="true"
                  className={`${
                    value ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </div>
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            const selectedOpt =
              STATUS_OPTIONS.find((opt) => opt.value._id === value) ||
              STATUS_OPTIONS[0];

            return (
              <Select
                label="Status"
                value={selectedOpt}
                onChange={(opt) => onChange(opt.value._id as EventStatusEnum)}
                onBlur={onBlur}
                options={STATUS_OPTIONS}
                validationError={error}
              />
            );
          }}
        />
      </div>

      {/* Footer Buttons */}
      <fieldset
        className={cn(
          "grid h-20 grid-cols-2 gap-4 border-t border-slate-200 dark:border-zinc-800 p-4",
        )}
      >
        {isEditing ? (
          <>
            <DeleteButton
              text="Delete"
              title="Delete Event"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
            />
            <BaseButton
              type="submit"
              text="Submit"
              loading={isPending}
              disabled={isPending || isDeletingPending}
              color="primary"
            />
          </>
        ) : (
          <>
            <BaseButton
              type="button"
              color="outline"
              text="Cancel"
              onClick={onCancel}
              disabled={isPending}
            />
            <BaseButton
              type="submit"
              text="Submit"
              loading={isPending}
              disabled={isPending}
              color="primary"
            />
          </>
        )}
      </fieldset>
    </form>
  );
};
