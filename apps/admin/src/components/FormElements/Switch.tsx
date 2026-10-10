"use client";

import React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";

import { useFieldIds } from "@/components/ui/FormField";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  /** Inline description next to the label (also used as the switch's description). */
  description?: React.ReactNode;
  /** Helper text under the switch row, linked via aria-describedby. */
  hint?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  color?: "indigo" | "emerald";
  className?: string;
  id?: string;
  name?: string;
  error?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  hint,
  disabled = false,
  required,
  color = "indigo",
  className,
  id: idProp,
  name,
  error,
}: SwitchProps) {
  const { id, hintId, errorId } = useFieldIds(idProp);
  const descriptionId = `${id}-description`;
  const activeBg = color === "emerald" ? "bg-emerald-600" : "bg-indigo-600";
  const focusRing =
    color === "emerald"
      ? "focus-visible:ring-emerald-500"
      : "focus-visible:ring-indigo-500";

  const describedBy =
    [description && descriptionId, hint && hintId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      <div
        className={clsx(
          "flex items-center justify-between rounded-2xl border p-3.5 transition-colors",
          "bg-slate-50 dark:bg-zinc-800/60",
          error ? "border-rose-500" : "border-slate-200 dark:border-zinc-700",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {(label || description) && (
          <div className="min-w-0 flex-1 pr-3">
            {label && (
              <label
                htmlFor={id}
                className={clsx(
                  "block select-none text-xs font-bold text-slate-800 dark:text-slate-200",
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
              >
                {label}
                {required && (
                  <span aria-hidden="true" className="ml-0.5 text-rose-500">
                    *
                  </span>
                )}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="mt-0.5 select-none text-[11px] text-slate-500 dark:text-slate-400"
              >
                {description}
              </p>
            )}
          </div>
        )}
        <HeadlessSwitch
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          className={clsx(
            checked ? activeBg : "bg-slate-300 dark:bg-zinc-600",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
            focusRing,
            disabled && "cursor-not-allowed",
          )}
        >
          {!label && <span className="sr-only">Toggle switch</span>}
          <span
            aria-hidden="true"
            className={clsx(
              checked ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </HeadlessSwitch>
      </div>
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
