import React from "react";
import { cn } from "@olive/ui";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, leftIcon, rightIcon, required, ...props },
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
          <input
            ref={ref}
            className={cn(
              "w-full text-sm bg-white/5 border border-white/10 rounded-xl py-2.5 text-white placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 min-h-[42px]",
              leftIcon ? "pl-9 pr-3" : "px-3.5",
              rightIcon && "pr-9",
              error &&
                "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
