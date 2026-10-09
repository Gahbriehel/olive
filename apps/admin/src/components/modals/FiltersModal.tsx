import { type JSX, type FormEvent, useState } from "react";
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
  ...rest
}: Props): JSX.Element {
  return (
    <SidebarModal title={title} display={display} close={close}>
      {/* Mount content only while open so the draft re-seeds from the
          applied values every time the panel opens. */}
      {display ? <FiltersModalContent {...rest} /> : <div></div>}
    </SidebarModal>
  );
}

function FiltersModalContent({
  fields,
  values,
  onApply,
  onClear,
}: Omit<Props, "display" | "close" | "title">): JSX.Element {
  const [draft, setDraft] = useState<FilterValues>(values);
  const [dateError, setDateError] = useState<string>();

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
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {fields.map((field) => {
        if (field.type === "dateRange") {
          return (
            <div key="dateRange" className="flex flex-col gap-3">
              {field.label && (
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {field.label}
                </label>
              )}
              {field.presets !== false && (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-wrap">
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
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold duration-300 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 md:px-4 cursor-pointer"
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
            </div>
          );
        }

        if (field.type === "text") {
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {field.label}
              </label>
              <Input
                type="text"
                value={draft[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {field.label}
            </label>
            <Select
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
          </div>
        );
      })}

      <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          className="flex-1 justify-center"
          onClick={clearAll}
          disabled={!hasAnything}
        >
          Clear all
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1 justify-center"
        >
          Apply
        </Button>
      </div>
    </form>
  );
}
