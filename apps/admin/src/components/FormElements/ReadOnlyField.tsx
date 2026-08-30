"use client";

import { type JSX, type ReactNode } from "react";

import { cn } from "@/helpers/cn";

interface Props {
  label?: string;
  value: ReactNode;
}

export function ReadOnlyField({ label, value }: Props): JSX.Element {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4">
      {label && (
        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          {label}
        </dt>
      )}
      <dd
        className={cn(
          "m-0 text-sm font-medium text-gray-900 dark:text-slate-100",
          isEmpty && "font-normal italic text-gray-500 dark:text-slate-400",
          !label && "sm:col-span-2",
        )}
      >
        {isEmpty ? "Not Provided" : value}
      </dd>
    </div>
  );
}
