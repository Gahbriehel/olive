"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/helpers/cn";

/**
 * Shared visual contract for every text-like control (input, textarea,
 * native select, combobox input). Compose with `controlErrorClass` when the
 * field is invalid.
 */
export const controlClass =
  "w-full min-h-[42px] rounded-xl border px-3.5 py-2.5 text-base sm:text-sm bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-zinc-800/60";

export const controlErrorClass =
  "border-rose-500 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500";

export interface FieldIds {
  id: string;
  hintId: string;
  errorId: string;
}

/** Stable ids for a field. A caller-supplied `id` wins over the generated one. */
export function useFieldIds(id?: string): FieldIds {
  const generated = useId();
  const base = id || generated;
  return { id: base, hintId: `${base}-hint`, errorId: `${base}-error` };
}

/** `aria-invalid` + `aria-describedby` for a control rendered inside FormField. */
export function fieldAria({
  errorId,
  hintId,
  error,
  hint,
  describedBy,
}: {
  errorId: string;
  hintId: string;
  error?: ReactNode;
  hint?: ReactNode;
  /** Any extra ids the caller already wanted in aria-describedby. */
  describedBy?: string;
}): {
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
} {
  const ids = [describedBy, hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids || undefined,
  };
}

export interface FormFieldProps {
  /** id of the control the label points at (see `useFieldIds`). */
  id: string;
  label?: ReactNode;
  /** Extra content rendered after the label/asterisk (e.g. a counter). */
  labelSuffix?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Defaults to `${id}-hint` / `${id}-error`, matching `useFieldIds`. */
  hintId?: string;
  errorId?: string;
  /** Optional id for the <label>, for controls named via aria-labelledby. */
  labelId?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint + error, all in normal document flow. */
export function FormField({
  id,
  label,
  labelSuffix,
  required,
  hint,
  error,
  hintId = `${id}-hint`,
  errorId = `${id}-error`,
  labelId,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-rose-500">
              *
            </span>
          )}
          {labelSuffix}
        </label>
      )}
      {children}
      {hint && (
        <p
          id={hintId}
          className="text-[11px] text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}
