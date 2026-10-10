import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/FormElements/Input";
import { type EventFormValues } from "../schemas/eventSchema";

interface EventScheduleSectionProps {
  control: Control<EventFormValues>;
  /** Called after the start date changes, so the end-date rule can re-run. */
  onStartDateChange: () => void;
}

/** Start and end date/time inputs. */
export function EventScheduleSection({
  control,
  onStartDateChange,
}: EventScheduleSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Controller
        name="startDate"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            onChange={(e) => {
              field.onChange(e);
              onStartDateChange();
            }}
            type="datetime-local"
            label="Start Date & Time"
            required
            error={error?.message}
          />
        )}
      />

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
  );
}
