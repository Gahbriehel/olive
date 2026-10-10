import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { Switch } from "@/components/FormElements/Switch";
import { cn } from "@/helpers/cn";
import { type EventFormValues } from "../schemas/eventSchema";
import { EventFormSection } from "./EventFormSection";

interface EventWebDisplaySectionProps {
  control: Control<EventFormValues>;
  setValue: UseFormSetValue<EventFormValues>;
}

/** Featured toggle, calendar sync and the program highlights list. */
export function EventWebDisplaySection({
  control,
  setValue,
}: EventWebDisplaySectionProps) {
  const highlights = useWatch({ control, name: "highlights" });

  const setHighlights = (next: string[]) =>
    setValue("highlights", next, { shouldDirty: true });

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

  return (
    <EventFormSection
      icon={<Sparkles className="w-4 h-4 text-warning" />}
      title="Web Display & Program Highlights"
    >
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
                  value ? "fill-warning text-warning" : "text-fg-subtle",
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
            No program highlights added yet. Click &quot;Add Highlight&quot; to
            define attendee takeaways.
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
                  onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                  placeholder="e.g. Midnight Intercession & Anointing"
                  className="flex-1 px-3 py-2 rounded-xl border border-border-control bg-surface-raised text-base text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="p-2 rounded-xl text-fg-subtle hover:text-danger-text hover:bg-danger-soft transition-colors cursor-pointer"
                  title="Remove Highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </EventFormSection>
  );
}
