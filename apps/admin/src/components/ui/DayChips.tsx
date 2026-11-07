"use client";

import React from "react";
import { cn } from "@/helpers/cn";
import { DAY_LABELS } from "@/models/night-prayer";

interface Props {
  value: number[];
  onChange: (days: number[]) => void;
  label?: string;
  /** Shown beside the chips when nothing is selected, e.g. "Every day". */
  emptyLabel?: string;
  error?: string;
}

/** Seven toggle chips, Sun (0) to Sat (6). */
export const DayChips: React.FC<Props> = ({
  value,
  onChange,
  label,
  emptyLabel,
  error,
}) => {
  const toggle = (d: number) =>
    onChange(
      value.includes(d)
        ? value.filter((x) => x !== d)
        : [...value, d].sort((a, b) => a - b),
    );

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-bold text-fg">{label}</p>}
      <div
        role="group"
        aria-label={label ?? "Days of the week"}
        className="flex flex-wrap items-center gap-1.5"
      >
        {DAY_LABELS.map((name, d) => {
          const on = value.includes(d);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(d)}
              className={cn(
                "h-8 min-w-11 rounded-full border px-3 text-xs font-semibold transition-colors",
                on
                  ? "border-primary bg-primary text-white"
                  : "border-border-control bg-surface text-fg-secondary hover:bg-subtle",
              )}
            >
              {name}
            </button>
          );
        })}
        {value.length === 0 && emptyLabel && (
          <span className="ml-1 text-xs text-fg-muted">{emptyLabel}</span>
        )}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
};
