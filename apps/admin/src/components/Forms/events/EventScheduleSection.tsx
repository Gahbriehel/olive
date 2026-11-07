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
    // Single column: the native date picker popup anchors to the input's left
    // edge and is ~400px wide, so a right-hand column pushes it off-screen.
    <div className="grid grid-cols-1 gap-3">
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
