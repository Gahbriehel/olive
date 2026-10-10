import { type JSX, type FormEvent, useId, useState } from "react";
import dayjs from "dayjs";

import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { Button } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import {
  countActiveFilters,
  type FilterField,
  type FilterValues,
} from "@/models/filters";

interface Props {
  display: boolean;
  close: () => void;
  fields: FilterField[];
  values: FilterValues;
  onApply: (values: FilterValues) => void;
  onClear: () => void;
  title?: string;
}

const DATE_FORMAT = "YYYY-MM-DD";

const datePresets = [
  { label: "Today", range: () => [dayjs(), dayjs()] },
  { label: "Last 7 Days", range: () => [dayjs().subtract(7, "day"), dayjs()] },
  {
    label: "This Month",
    range: () => [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "Last 3 Months",
    range: () => [dayjs().subtract(3, "month"), dayjs()],
  },
] as const;

/**
 * Generic filters sidebar driven by a FilterField schema. Edits are held in a
 * local draft and only committed on Apply. Pair with useListFilters and spread
 * its `panelProps`.
 */
export function FiltersModal({
  title = "Filters",
  display,
  close,
  fields,
  values,
  onApply,
  onClear,
}: Props): JSX.Element {
  const formId = useId();
  const [draft, setDraft] = useState<FilterValues>(values);
  const [dateError, setDateError] = useState<string>();

  // Re-seed the draft from the applied values every time the panel opens.
  const [wasOpen, setWasOpen] = useState(display);
  if (display !== wasOpen) {
    setWasOpen(display);
    if (display) {
      setDraft(values);
      setDateError(undefined);
    }
  }

  function setValue(key: keyof FilterValues, value: string): void {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: FormEvent): void {
    e.preventDefault();
    if (
      draft.startDate &&
      draft.endDate &&
      dayjs(draft.endDate).isBefore(draft.startDate)
    ) {
      setDateError("End date must be after start date");
      return;
    }
    onApply(draft);
  }

  function clearAll(): void {
    setDraft({});
    setDateError(undefined);
    onClear();
  }

  const hasAnything =
    countActiveFilters(fields, draft) + countActiveFilters(fields, values) > 0;

  return (
    <SidebarModal
      title={title}
      isOpen={display}
      onClose={close}
      footer={
        <>
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={!hasAnything}
            className="sm:mr-auto"
          >
            Clear all
          </Button>
          <Button type="submit" form={formId}>
            Apply filters
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-5">
        {fields.map((field) => {
          if (field.type === "dateRange") {
            return (
              <fieldset key="dateRange" className="flex flex-col gap-3">
                {field.label && (
                  <legend className="mb-3 text-xs font-semibold text-fg-secondary">
                    {field.label}
                  </legend>
                )}
                {field.presets !== false && (
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                    {datePresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const [start, end] = preset.range();
                          setDraft((prev) => ({
                            ...prev,
                            startDate: start.format(DATE_FORMAT),
                            endDate: end.format(DATE_FORMAT),
                          }));
                          setDateError(undefined);
                        }}
                        className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:px-4 text-fg-secondary"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Start Date"
                    type="date"
                    value={draft.startDate ?? ""}
                    onChange={(e) => {
                      setValue("startDate", e.target.value);
                      setDateError(undefined);
                    }}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={draft.endDate ?? ""}
                    error={dateError}
                    onChange={(e) => {
                      setValue("endDate", e.target.value);
                      setDateError(undefined);
                    }}
                  />
                </div>
              </fieldset>
            );
          }

          if (field.type === "text") {
            return (
              <Input
                key={field.key}
                label={field.label}
                type="text"
                value={draft[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            );
          }

          return (
            <Select
              key={field.key}
              label={field.label}
              value={draft[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
            >
              <option value="">{field.allLabel ?? "All"}</option>
              {field.type === "boolean" ? (
                <>
                  <option value="true">{field.trueLabel}</option>
                  <option value="false">{field.falseLabel}</option>
                </>
              ) : (
                field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )}
            </Select>
          );
        })}
      </form>
    </SidebarModal>
  );
}
