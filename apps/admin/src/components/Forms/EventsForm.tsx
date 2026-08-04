"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";

export type EventStatusEnum = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export interface EventFormValues {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  status: EventStatusEnum;
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

  const formatForDateTimeInput = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return dateStr;
    }
  };

  const { control, handleSubmit, watch, formState } = useForm<EventFormValues>({
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      location: initialValues?.location || "",
      startDate: formatForDateTimeInput(initialValues?.startDate) || "",
      endDate: formatForDateTimeInput(initialValues?.endDate) || "",
      status: initialValues?.status || "DRAFT",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDateValue = watch("startDate");

  const onFormSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        status: data.status || "DRAFT",
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
            <Input
              {...field}
              label="Description"
              placeholder="Enter brief description..."
              error={error?.message}
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
