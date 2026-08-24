import React from "react";
import { clsx } from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, leftIcon, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            className={clsx(
              "w-full text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 min-h-[42px] appearance-none cursor-pointer pr-10",
              leftIcon && "pl-10",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <span className="absolute right-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            ▼
          </span>
        </div>
        {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
