import React from "react";
import { Eye, EyeOff, X } from "lucide-react";

import { cn } from "@/helpers/cn";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Helper text under the control, linked via aria-describedby. */
  hint?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcutHint?: string;
  countryCode?: string;
  password?: boolean;
  required?: boolean;
  hidePassword?: () => void;
  showPassword?: () => void;
  icon?: React.ReactNode;
  isClearable?: boolean;
  onClear?: () => void;
  /** Class for the outer field wrapper (label + control + messages). */
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      icon,
      shortcutHint,
      countryCode,
      password,
      required,
      hidePassword,
      showPassword,
      isClearable,
      onClear,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const { id, hintId, errorId } = useFieldIds(idProp);
    const finalRightIcon = icon || rightIcon;
    const hasValue =
      props.value !== undefined && String(props.value).length > 0;
    const showClear =
      (isClearable ?? true) &&
      hasValue &&
      !password &&
      !props.disabled &&
      !props.readOnly;
    const showTrailing = !password && (shortcutHint || finalRightIcon);
    const trailingCount =
      (password ? 1 : 0) + (showClear ? 1 : 0) + (showTrailing ? 1 : 0);

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (props.onChange) {
        const e = {
          target: { value: "" },
          currentTarget: { value: "" },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        props.onChange(e);
      }
    };

    const isHidden = props.type === "password";
    const aria = fieldAria({
      errorId,
      hintId,
      error,
      hint,
      describedBy: props["aria-describedby"],
    });

    return (
      <FormField
        id={id}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={containerClassName}
      >
        <div className="relative flex items-center">
          {countryCode && (
            <div className="flex min-h-[42px] items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/60">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {countryCode}
              </span>
            </div>
          )}
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-slate-400 dark:text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-required={required || undefined}
            {...props}
            aria-invalid={aria["aria-invalid"] ?? props["aria-invalid"]}
            aria-describedby={aria["aria-describedby"]}
            className={cn(
              controlClass,
              countryCode && "rounded-l-none",
              leftIcon && "pl-10",
              trailingCount === 1 && "pr-10",
              trailingCount >= 2 && "pr-20",
              error && controlErrorClass,
              className,
            )}
          />
          {password && (
            <button
              type="button"
              aria-label={isHidden ? "Show password" : "Hide password"}
              aria-controls={id}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:text-slate-500 dark:hover:text-slate-300"
              onClick={isHidden ? showPassword : hidePassword}
            >
              {isHidden ? (
                <Eye className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
          {showClear && (
            <button
              type="button"
              aria-label={label ? `Clear ${label}` : "Clear"}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:text-slate-500 dark:hover:text-slate-300",
                showTrailing ? "right-10" : "right-3",
              )}
              onClick={handleClear}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {shortcutHint && !password && (
            <span className="pointer-events-none absolute right-3 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-400">
              {shortcutHint}
            </span>
          )}
          {finalRightIcon && !shortcutHint && !password && (
            <span className="absolute right-3 text-slate-400 dark:text-slate-500">
              {finalRightIcon}
            </span>
          )}
        </div>
      </FormField>
    );
  },
);

Input.displayName = "Input";
