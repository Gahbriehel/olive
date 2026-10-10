import { Controller, useWatch, type Control } from "react-hook-form";
import { DoorOpen, Ticket } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Switch } from "@/components/FormElements/Switch";
import { type EventFormValues } from "../schemas/eventSchema";
import { EventFormSection } from "./EventFormSection";

interface EventAdmissionSectionProps {
  control: Control<EventFormValues>;
}

/** Registration toggle and, when registration is on, the capacity limit. */
export function EventAdmissionSection({ control }: EventAdmissionSectionProps) {
  const requiresRegistration = useWatch({
    control,
    name: "requiresRegistration",
  });

  return (
    <EventFormSection
      icon={<Ticket className="w-4 h-4 text-primary" />}
      title="Admission & Registration Mode"
    >
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
        <div className="p-3.5 rounded-xl bg-success-soft border border-success-border text-success-text text-xs flex items-start gap-2.5 animate-fade-in">
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
    </EventFormSection>
  );
}
