"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "@headlessui/react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Star,
  Ticket,
  DoorOpen,
  Users,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/helpers/cn";
import { uploadsService } from "@/services/uploads.service";
import { formatDateTimeInput, toISOInEventTimezone } from "@/utils/formatters";
import {
  EventCategory,
  EventStatus,
  CreateOrUpdateEventPayload,
  getCategoryColor,
} from "@/models/event";

export type EventStatusEnum = EventStatus;

export interface EventFormValues {
  title: string;
  description?: string;
  category: EventCategory;
  location?: string;
  capacity?: number | string;
  startDate: string;
  endDate: string;
  status: EventStatusEnum;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  requiresRegistration?: boolean;
  isFeatured?: boolean;
}

interface EventsFormProps {
  initialValues?: Partial<CreateOrUpdateEventPayload> & {
    id?: string;
    autoAssignTeams?: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic Registration Mode & Highlights state
  const [requiresRegistration, setRequiresRegistration] = useState<boolean>(
    initialValues?.requiresRegistration !== undefined
      ? Boolean(initialValues.requiresRegistration)
      : true,
  );

  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialValues?.isFeatured !== undefined
      ? Boolean(initialValues.isFeatured)
      : false,
  );

  const [autoAssignTeams, setAutoAssignTeams] = useState<boolean>(
    initialValues?.autoAssignTeams !== undefined
      ? Boolean(initialValues.autoAssignTeams)
      : true,
  );

  const [highlights, setHighlights] = useState<string[]>(() => {
    if (
      Array.isArray(initialValues?.highlights) &&
      initialValues.highlights.length > 0
    ) {
      return initialValues.highlights;
    }
    return [];
  });

  const { control, handleSubmit, watch, setValue, formState } =
    useForm<EventFormValues>({
      defaultValues: {
        title: initialValues?.title || "",
        category: (initialValues?.category as EventCategory) || "GENERAL",
        description: initialValues?.description || "",
        location: initialValues?.location || "",
        capacity:
          initialValues?.capacity !== undefined &&
          initialValues?.capacity !== null
            ? initialValues.capacity
            : "",
        startDate: formatDateTimeInput(initialValues?.startDate) || "",
        endDate: formatDateTimeInput(initialValues?.endDate) || "",
        status: (initialValues?.status as EventStatusEnum) || "DRAFT",
        imageUrl: initialValues?.imageUrl || "",
        googleCalendarSync: initialValues?.googleCalendarSync ?? false,
      },
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const startDateValue = watch("startDate");
  const imageUrlValue = watch("imageUrl");
  const categoryValue = watch("category");

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

  const handleAddHighlight = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const handleUpdateHighlight = (index: number, val: string) => {
    setHighlights((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      const cleanedHighlights = highlights
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
        requiresRegistration,
        capacity:
          requiresRegistration && data.capacity && Number(data.capacity) > 0
            ? Number(data.capacity)
            : null,
        highlights:
          cleanedHighlights.length > 0 ? cleanedHighlights : undefined,
        isFeatured,
      };

      await onSubmit(payload);
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
      className="flex flex-col h-full space-y-6 p-1"
    >
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {/* SECTION 1: BASIC DETAILS & TIMING */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
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
            rules={{ required: "Event title is required" }}
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
              rules={{ required: "Ministry category is required" }}
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
                  if (
                    startDateValue &&
                    new Date(val) < new Date(startDateValue)
                  ) {
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-500" />
              Admission & Registration Mode
            </h3>
          </div>

          {/* Main Admission Toggle Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
            <div className="pr-3">
              <label
                onClick={() => setRequiresRegistration(!requiresRegistration)}
                className="text-xs font-bold text-slate-900 dark:text-slate-100 block cursor-pointer select-none"
              >
                Require Online Registration
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Turn on for ticketed seating, capacity limits, and team
                assignment.
              </p>
            </div>
            <Switch
              checked={requiresRegistration}
              onChange={setRequiresRegistration}
              className={`${
                requiresRegistration
                  ? "bg-indigo-600"
                  : "bg-slate-300 dark:bg-zinc-700"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <span className="sr-only">Require Registration</span>
              <span
                aria-hidden="true"
                className={`${
                  requiresRegistration ? "translate-x-5" : "translate-x-0"
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {!requiresRegistration ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <DoorOpen className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold">Open Admission Program</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
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

              {/* Automatically assign attendees to teams switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
                <div className="pr-3 flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <label
                      onClick={() => setAutoAssignTeams(!autoAssignTeams)}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer select-none"
                    >
                      Automatically assign attendees to teams
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Evenly balance incoming registrants across house teams
                      upon checkout.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoAssignTeams}
                  onChange={setAutoAssignTeams}
                  className={`${
                    autoAssignTeams
                      ? "bg-cyan-600"
                      : "bg-slate-300 dark:bg-zinc-600"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <span className="sr-only">Auto-assign teams</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      autoAssignTeams ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: FLYER & MEDIA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
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
              <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-zinc-700">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
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
              <span className="text-[11px] text-slate-400">
                Max 3MB (JPEG, PNG, WEBP)
              </span>
            </div>

            {imageUrlValue && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 group mt-2">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Web Display & Program Highlights
            </h3>
          </div>

          {/* Feature on Homepage Banner Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <div className="pr-3 flex items-start gap-2.5">
              <Star
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                  isFeatured
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-400",
                )}
              />
              <div>
                <label
                  onClick={() => setIsFeatured(!isFeatured)}
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 block cursor-pointer select-none"
                >
                  Feature on Website Banner
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pins this event to the top hero carousel on the church web
                  portal.
                </p>
              </div>
            </div>
            <Switch
              checked={isFeatured}
              onChange={setIsFeatured}
              className={`${
                isFeatured ? "bg-amber-500" : "bg-slate-300 dark:bg-zinc-600"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500`}
            >
              <span className="sr-only">Feature on Homepage Banner</span>
              <span
                aria-hidden="true"
                className={`${
                  isFeatured ? "translate-x-5" : "translate-x-0"
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>

          {/* Google Calendar Sync Switch */}
          <Controller
            name="googleCalendarSync"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
                <div className="pr-3">
                  <label
                    onClick={() => onChange(!value)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer select-none"
                  >
                    Google Calendar Sync
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Allow attendees to sync event dates & receive .ics calendar
                    invites.
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

          {/* Program Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Program Highlights
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Keynotes, sessions, and attendee takeaways
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Highlight</span>
              </button>
            </div>

            {highlights.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700">
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
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleUpdateHighlight(idx, e.target.value)
                      }
                      placeholder="e.g. Midnight Intercession & Anointing"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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

      {/* FOOTER BUTTONS */}
      <fieldset
        className={cn(
          "grid h-20 grid-cols-2 gap-4 border-t border-slate-200 dark:border-zinc-800 pt-4",
        )}
      >
        {isEditing ? (
          <>
            <DeleteButton
              text="Delete Event"
              title="Delete Event"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
            />
            <BaseButton
              type="submit"
              text="Save Changes"
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
              text="Create Event"
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
