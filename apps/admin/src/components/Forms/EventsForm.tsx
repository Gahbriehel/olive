"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, DeleteButton } from "@/components/ui/Button";
import { formatDateTimeInput, toISOInEventTimezone } from "@/utils/formatters";
import {
  EventCategory,
  EventStatus,
  CreateOrUpdateEventPayload,
} from "@/models/event";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { eventSchema, type EventFormValues } from "./schemas/eventSchema";
import { EventBasicsSection } from "./events/EventBasicsSection";
import { EventScheduleSection } from "./events/EventScheduleSection";
import { EventAdmissionSection } from "./events/EventAdmissionSection";
import { EventMediaSection } from "./events/EventMediaSection";
import { EventWebDisplaySection } from "./events/EventWebDisplaySection";

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

  const { control, handleSubmit, setValue, trigger, getFieldState, formState } =
    useForm<EventFormValues>({
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

  // The end-date rule depends on the start date, so re-check it once the
  // user has already interacted with the end date (or tried to submit).
  const revalidateEndDate = () => {
    if (getFieldState("endDate", formState).isTouched || formState.isSubmitted)
      void trigger("endDate");
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
        <EventBasicsSection
          control={control}
          schedule={
            <EventScheduleSection
              control={control}
              onStartDateChange={revalidateEndDate}
            />
          }
        />
        <EventAdmissionSection control={control} />
        <EventMediaSection
          control={control}
          setValue={setValue}
          isUploading={isUploading}
          onUploadingChange={setIsUploading}
        />
        <EventWebDisplaySection control={control} setValue={setValue} />
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
