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
  color?: "indigo" | "emerald" | "amber";
  /** Optional leading icon shown before the label. */
  icon?: React.ReactNode;
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
  icon,
  className,
  id: idProp,
  name,
  error,
}: SwitchProps) {
  const { id, hintId, errorId } = useFieldIds(idProp);
  const descriptionId = `${id}-description`;
  const activeBg = {
    indigo: "bg-primary",
    emerald: "bg-success",
    amber: "bg-warning",
  }[color];
  const focusRing = {
    indigo: "focus-visible:ring-primary",
    emerald: "focus-visible:ring-success",
    amber: "focus-visible:ring-warning",
  }[color];

  const describedBy =
    [description && descriptionId, hint && hintId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      <div
        className={clsx(
          "flex items-center justify-between rounded-2xl border p-3.5 transition-colors",
          "bg-subtle",
          error ? "border-danger" : "border-border-control",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {(label || description) && (
          <div className="flex min-w-0 flex-1 items-start gap-2.5 pr-3">
            {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
            <div className="min-w-0 flex-1">
              {label && (
                <label
                  htmlFor={id}
                  className={clsx(
                    "block select-none text-xs font-bold text-fg",
                    disabled ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  {label}
                  {required && (
                    <span
                      aria-hidden="true"
                      className="ml-0.5 text-danger-text"
                    >
                      *
                    </span>
                  )}
                </label>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-0.5 select-none text-2xs text-fg-muted"
                >
                  {description}
                </p>
              )}
            </div>
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
            checked ? activeBg : "bg-fg-subtle",
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
        <p id={hintId} className="text-2xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-danger-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}
