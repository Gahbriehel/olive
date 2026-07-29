import React from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-slate-100",
    outline:
      "border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-800",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100",
    destructive:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm dark:bg-rose-600 dark:hover:bg-rose-500",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 min-h-[36px] rounded-lg gap-1.5",
    md: "text-sm px-4 py-2 min-h-[42px] rounded-xl gap-2",
    lg: "text-base px-5 py-2.5 min-h-[48px] rounded-xl gap-2.5",
    icon: "p-2.5 min-w-[42px] min-h-[42px] rounded-xl justify-center",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && (
            <span className="inline-flex shrink-0">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
};
