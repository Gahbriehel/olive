"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Ticket,
  DoorOpen,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Switch } from "@/components/FormElements/Switch";
import { TextArea } from "@/components/FormElements/TextArea";
import { Select, type ISelect } from "@/components/ui/Select";
import { Button, DeleteButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/helpers/cn";
import { useUploadFlyer } from "@/hooks/useUploads";
import { formatDateTimeInput, toISOInEventTimezone } from "@/utils/formatters";
import {
  EventCategory,
  EventStatus,
  CreateOrUpdateEventPayload,
  getCategoryColor,
} from "@/models/event";
import { Spinner } from "@/components/ui/Spinner";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { eventSchema, type EventFormValues } from "./schemas/eventSchema";

export type EventStatusEnum = EventStatus;
export type { EventFormValues };

interface EventsFormProps {
  initialValues?: Partial<CreateOrUpdateEventPayload> & {
    id?: string;
  };
  onSubmit: (data: CreateOrUpdateEventPayload) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const CATEGORY_OPTIONS: ISelect[] = [
  { value: { _id: "GENERAL" }, label: "General" },
  { value: { _id: "CONFERENCE" }, label: "Conference" },
  { value: { _id: "VIGIL" }, label: "Vigil" },
  { value: { _id: "COMMUNION" }, label: "Holy Communion Service" },
  { value: { _id: "REVIVAL" }, label: "Revival" },
  { value: { _id: "WORSHIP" }, label: "Worship Experience" },
  { value: { _id: "OUTREACH" }, label: "Outreach" },
];

const STATUS_OPTIONS: ISelect[] = [
  { value: { _id: "DRAFT" }, label: "Draft" },
  { value: { _id: "PUBLISHED" }, label: "Published" },
  { value: { _id: "COMPLETED" }, label: "Completed" },
  { value: { _id: "CANCELLED" }, label: "Cancelled" },
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
  const [isDeletingState, setIsDeletingState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getFieldState,
    formState,
  } = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema),
    mode: "onTouched",
    defaultValues: {
      title: initialValues?.title || "",
      category: (initialValues?.category as EventCategory) || "GENERAL",
      description: initialValues?.description || "",
      location: initialValues?.location || "",
      capacity:
        initialValues?.capacity !== undefined &&
        initialValues?.capacity !== null
          ? String(initialValues.capacity)
          : "",
      startDate: formatDateTimeInput(initialValues?.startDate) || "",
      endDate: formatDateTimeInput(initialValues?.endDate) || "",
      status: (initialValues?.status as EventStatusEnum) || "DRAFT",
      imageUrl: initialValues?.imageUrl || "",
      googleCalendarSync: initialValues?.googleCalendarSync ?? false,
      requiresRegistration:
        initialValues?.requiresRegistration !== undefined
          ? Boolean(initialValues.requiresRegistration)
          : true,
      isFeatured:
        initialValues?.isFeatured !== undefined
          ? Boolean(initialValues.isFeatured)
          : false,
      highlights: Array.isArray(initialValues?.highlights)
        ? [...initialValues.highlights]
        : [],
    },
  });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const imageUrlValue = watch("imageUrl");
  const categoryValue = watch("category");
  const requiresRegistration = watch("requiresRegistration");
  const highlights = watch("highlights");

  // The end-date rule depends on the start date, so re-check it once the
  // user has already interacted with the end date (or tried to submit).
  const revalidateEndDate = () => {
    if (getFieldState("endDate", formState).isTouched || formState.isSubmitted)
      void trigger("endDate");
  };

  const setHighlights = (next: string[]) =>
    setValue("highlights", next, { shouldDirty: true });

  const { uploadFlyer } = useUploadFlyer();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const uploadedUrl = await uploadFlyer(file);
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

  const handleAddHighlight = () => {
    setHighlights([...highlights, ""]);
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    const copy = [...highlights];
    copy[index] = val;
    setHighlights(copy);
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: EventFormValues) => {
    const cleanedHighlights = data.highlights
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const payload: CreateOrUpdateEventPayload = {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      category: data.category || "GENERAL",
      startDate: toISOInEventTimezone(data.startDate),
      endDate: toISOInEventTimezone(data.endDate),
      location: data.location?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      status: data.status || "DRAFT",
      googleCalendarSync: Boolean(data.googleCalendarSync),
      requiresRegistration: data.requiresRegistration,
      capacity:
        data.requiresRegistration && data.capacity && Number(data.capacity) > 0
          ? Number(data.capacity)
          : null,
      highlights: cleanedHighlights.length > 0 ? cleanedHighlights : undefined,
      isFeatured: data.isFeatured,
    };

    await onSubmit(payload);
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

  const isPending = isLoading || formState.isSubmitting;
  const isDeletingPending = isDeleting || isDeletingState;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="space-y-6">
        {/* SECTION 1: BASIC DETAILS & TIMING */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              General Details & Schedule
            </h3>
            <Badge
              color={getCategoryColor(categoryValue || "GENERAL")}
              size="sm"
            >
              {categoryValue || "GENERAL"}
            </Badge>
          </div>

          {/* Event Title */}
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Event Title"
                placeholder="e.g. Annual Holy Ghost Summit"
                required
                error={error?.message}
              />
            )}
          />

          {/* Category & Status Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ministry Category */}
            <Controller
              name="category"
              control={control}
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
              }) => {
                const selectedOpt =
                  CATEGORY_OPTIONS.find((opt) => opt.value._id === value) ||
                  CATEGORY_OPTIONS[0];

                return (
                  <Select
                    label="Ministry Category"
                    required
                    value={selectedOpt}
                    onChange={(opt) => onChange(opt.value._id as EventCategory)}
                    onBlur={onBlur}
                    options={CATEGORY_OPTIONS}
                    validationError={error}
                  />
                );
              }}
            />

            {/* Publication Status */}
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
                    label="Publication Status"
                    value={selectedOpt}
                    onChange={(opt) =>
                      onChange(opt.value._id as EventStatusEnum)
                    }
                    onBlur={onBlur}
                    options={STATUS_OPTIONS}
                    validationError={error}
                  />
                );
              }}
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start Date */}
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    revalidateEndDate();
                  }}
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
          </div>

          {/* Location */}
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Location / Venue"
                placeholder="e.g. Main Auditorium & Online Stream"
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
                label="Event Description"
                placeholder="Provide a comprehensive summary and expectations for attendees..."
                error={error?.message}
                rows={3}
              />
            )}
          />
        </div>

        {/* SECTION 2: ADMISSION & REGISTRATION SETTINGS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-500" />
              Admission & Registration Mode
            </h3>
          </div>

          <Controller
            name="requiresRegistration"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <Switch
                name={name}
                label="Require Online Registration"
                description="Turn on for ticketed seating, capacity limits, and team assignment."
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          {!requiresRegistration ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <DoorOpen className="w-4 h-4 mt-0.5 shrink-0 text-success-text" />
              <div>
                <p className="font-bold">Open Admission Program</p>
                <p className="text-2xs text-fg-secondary mt-0.5">
                  Admission is open to all attendees. Pre-registration and team
                  rosters are not required.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 pt-1 animate-fade-in">
              {/* Capacity Limit */}
              <Controller
                name="capacity"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Capacity Limit"
                    placeholder="e.g. 500 (Leave empty for unlimited capacity)"
                    error={error?.message}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* SECTION 3: FLYER & MEDIA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Flyer & Promotional Media
            </h3>
          </div>

          <div className="space-y-3">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  label="Flyer Image URL"
                  placeholder="https://... or upload image below"
                  error={error?.message}
                />
              )}
            />

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted hover:bg-muted-strong cursor-pointer text-xs font-semibold text-fg-secondary transition-colors border border-border-control">
                {isUploading ? (
                  <Spinner size="sm" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-500" />
                )}
                <span>
                  {isUploading ? "Uploading..." : "Upload Flyer Image"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden cursor-pointer"
                />
              </label>
              <span className="text-2xs text-slate-400">
                Max 3MB (JPEG, PNG, WEBP)
              </span>
            </div>

            {imageUrlValue && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-control bg-subtle group mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrlValue}
                  alt="Flyer Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue("imageUrl", "", { shouldDirty: true })
                  }
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: WEB VISIBILITY & HIGHLIGHTS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Web Display & Program Highlights
            </h3>
          </div>

          <Controller
            name="isFeatured"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <Switch
                name={name}
                label="Feature on Website Banner"
                description="Pins this event to the top hero carousel on the church web portal."
                color="amber"
                icon={
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      value
                        ? "fill-amber-500 text-amber-500"
                        : "text-slate-400",
                    )}
                  />
                }
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="googleCalendarSync"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <Switch
                name={name}
                label="Google Calendar Sync"
                description="Allow attendees to sync event dates & receive .ics calendar invites."
                color="emerald"
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          {/* Program Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-fg block">
                  Program Highlights
                </span>
                <p className="text-2xs text-fg-muted">
                  Keynotes, sessions, and attendee takeaways
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-soft text-primary-text hover:bg-primary-soft transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Highlight</span>
              </button>
            </div>

            {highlights.length === 0 ? (
              <div className="p-4 text-center text-xs text-fg-subtle bg-subtle rounded-xl border border-dashed border-border-control">
                No program highlights added yet. Click &quot;Add Highlight&quot;
                to define attendee takeaways.
              </div>
            ) : (
              <div className="space-y-2">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 animate-fade-in"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-soft text-primary-text text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleUpdateHighlight(idx, e.target.value)
                      }
                      placeholder="e.g. Midnight Intercession & Anointing"
                      className="flex-1 px-3 py-2 rounded-xl border border-border-control bg-surface-raised text-base text-fg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-danger-soft transition-colors cursor-pointer"
                      title="Remove Highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FormFooter
        destructive={
          isEditing && onDelete ? (
            <DeleteButton
              text="Delete Event"
              title="Delete Event"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
              disabled={isPending || isUploading}
            />
          ) : undefined
        }
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isPending || isUploading || isDeletingPending}
        >
          {isEditing ? "Save changes" : "Create event"}
        </Button>
      </FormFooter>
    </form>
  );
};
