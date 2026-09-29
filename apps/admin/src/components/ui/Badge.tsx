import React from "react";
import { clsx } from "clsx";

export type BadgeVariant =
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "cyan"
  | "purple"
  | "blue"
  | "gold";

export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  variant?: BadgeVariant;
  color?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant,
  color,
  size = "md",
  dot = false,
  ...props
}) => {
  const activeVariant: BadgeVariant = color || variant || "slate";

  const base =
    "inline-flex items-center font-medium rounded-full transition-colors";

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const variants: Record<BadgeVariant, string> = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
    amber:
      "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
    rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
    slate: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300",
    cyan: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300",
    purple:
      "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
    gold: "bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold",
  };

  const dotColors: Record<BadgeVariant, string> = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-400",
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    gold: "bg-amber-400",
  };

  return (
    <span
      className={clsx(base, sizes[size], variants[activeVariant], className)}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[activeVariant],
          )}
        />
      )}
      {children}
    </span>
  );
};
