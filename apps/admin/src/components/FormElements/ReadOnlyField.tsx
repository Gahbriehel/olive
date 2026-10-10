"use client";

import { type JSX, type ReactNode } from "react";

import { cn } from "@/helpers/cn";
import { useFieldIds } from "@/components/ui/FormField";

interface Props {
  label?: string;
  value: ReactNode;
  id?: string;
}

/** Label + value pair for view mode. The value is labelled by the label. */
export function ReadOnlyField({
  label,
  value,
  id: idProp,
}: Props): JSX.Element {
  const { id } = useFieldIds(idProp);
  const labelId = `${id}-label`;
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4"
    >
      {label && (
        <span id={labelId} className="text-xs font-semibold text-fg-muted">
          {label}
        </span>
      )}
      <div
        id={id}
        className={cn(
          "m-0 text-sm font-medium text-fg",
          isEmpty && "font-normal italic text-fg-muted",
          !label && "sm:col-span-2",
        )}
      >
        {isEmpty ? "Not Provided" : value}
      </div>
    </div>
  );
}
