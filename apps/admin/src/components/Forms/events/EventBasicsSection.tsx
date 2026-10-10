import React from "react";
import { Controller, useWatch, type Control } from "react-hook-form";
import { Calendar } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Select, type ISelect } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EventCategory, EventStatus, getCategoryColor } from "@/models/event";
import { type EventFormValues } from "../schemas/eventSchema";
import { EventFormSection } from "./EventFormSection";

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

interface EventBasicsSectionProps {
  control: Control<EventFormValues>;
  /** The schedule fields, rendered between status and location. */
  schedule: React.ReactNode;
}

/** Title, category, status, location and description (plus the schedule slot). */
export function EventBasicsSection({
  control,
  schedule,
}: EventBasicsSectionProps) {
  const categoryValue = useWatch({ control, name: "category" });

  return (
    <EventFormSection
      icon={<Calendar className="w-4 h-4 text-primary" />}
      title="General Details & Schedule"
      aside={
        <Badge color={getCategoryColor(categoryValue || "GENERAL")} size="sm">
          {categoryValue || "GENERAL"}
        </Badge>
      }
    >
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
                onChange={(opt) => onChange(opt.value._id as EventStatus)}
                onBlur={onBlur}
                options={STATUS_OPTIONS}
                validationError={error}
              />
            );
          }}
        />
      </div>

      {schedule}

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
    </EventFormSection>
  );
}
