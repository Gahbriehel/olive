"use client";

import React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { clsx } from "clsx";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  color?: "indigo" | "emerald";
  className?: string;
  id?: string;
  error?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  color = "indigo",
  className,
  id,
  error,
}: SwitchProps) {
  const activeBg = color === "emerald" ? "bg-emerald-600" : "bg-indigo-600";
  const focusRing =
    color === "emerald" ? "focus:ring-emerald-500" : "focus:ring-indigo-500";

  return (
    <div className={clsx("flex flex-col gap-1 w-full", className)}>
      <div
        className={clsx(
          "flex items-center justify-between p-3.5 rounded-2xl border transition-colors",
          "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {(label || description) && (
          <div className="pr-3 flex-1 min-w-0">
            {label && (
              <label
                htmlFor={id}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 block cursor-pointer select-none"
                onClick={() => !disabled && onChange(!checked)}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 select-none mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
        <HeadlessSwitch
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            checked ? activeBg : "bg-slate-300 dark:bg-zinc-600",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
            focusRing,
            disabled && "cursor-not-allowed",
          )}
        >
          <span className="sr-only">
            {typeof label === "string" ? label : "Toggle switch"}
          </span>
          <span
            aria-hidden="true"
            className={clsx(
              checked ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </HeadlessSwitch>
      </div>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
}
