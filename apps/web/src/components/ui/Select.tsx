import React from "react";
import { cn } from "@olive/ui";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, leftIcon, required, children, ...props },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-300">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            className={cn(
              "w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 min-h-[42px] appearance-none cursor-pointer pr-10",
              leftIcon && "pl-9",
              error &&
                "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <span className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
            ▼
          </span>
        </div>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
