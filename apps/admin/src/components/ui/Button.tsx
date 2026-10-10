"use client";

import {
  type ButtonHTMLAttributes,
  type JSX,
  type ReactNode,
  forwardRef,
  useState,
} from "react";

import { cn } from "@/helpers/cn";

import { Spinner } from "@/components/ui/Spinner";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and swaps the leading icon for a spinner. */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const base =
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-xl border font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-base",
  icon: "h-9 w-9 p-0 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-indigo-600 bg-indigo-600 text-white shadow-xs hover:border-indigo-700 hover:bg-indigo-700",
  secondary:
    "border-slate-800 bg-slate-800 text-white shadow-xs hover:bg-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700",
  outline:
    "border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800",
  danger:
    "border-rose-600 bg-rose-600 text-white shadow-xs hover:border-rose-700 hover:bg-rose-700",
};

const spinnerColour: Record<ButtonVariant, string> = {
  primary: "text-current",
  secondary: "text-current",
  danger: "text-current",
  outline: "text-indigo-600 dark:text-indigo-400",
  ghost: "text-indigo-600 dark:text-indigo-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      type = "button",
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const spinner = (
      <Spinner
        size={size === "sm" ? "xs" : "sm"}
        className={spinnerColour[variant]}
      />
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      >
        {loading ? spinner : leftIcon}
        {/* Icon-only buttons keep their single child; the spinner replaces it. */}
        {loading && size === "icon" && !leftIcon ? null : children}
        {rightIcon}
      </button>
    );
  },
);

interface DeleteButtonProps {
  text?: string;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void | Promise<void>;
  className?: string;
}

/** A danger button that always asks for confirmation before running `onClick`. */
export function DeleteButton({
  loading,
  disabled,
  onClick,
  title,
  text = "Delete",
  type = "button",
  className,
}: DeleteButtonProps): JSX.Element {
  const [display, setDisplay] = useState(false);
  return (
    <>
      <Button
        type={type}
        variant="danger"
        onClick={() => setDisplay(true)}
        loading={loading}
        disabled={disabled}
        className={className}
      >
        {text}
      </Button>
      <ConfirmActionModal
        actionName={text}
        tone="danger"
        title={title}
        fn={onClick ?? (() => {})}
        loading={loading}
        close={() => setDisplay(false)}
        display={display}
      />
    </>
  );
}
