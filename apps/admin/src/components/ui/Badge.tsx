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
    sm: "px-2.5 py-0.5 text-2xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const variants: Record<BadgeVariant, string> = {
    indigo: "bg-primary-soft text-primary-text",
    emerald: "bg-success-soft text-success-text",
    amber: "bg-warning-soft text-warning-text",
    rose: "bg-danger-soft text-danger-text",
    slate: "bg-muted text-fg-secondary",
    cyan: "bg-info-soft text-info-text",
    /* eslint-disable no-restricted-syntax -- categorical colours with no semantic token */
    purple:
      "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
    /* eslint-enable no-restricted-syntax */
    gold: "bg-warning-soft text-warning-text font-semibold",
  };

  const dotColors: Record<BadgeVariant, string> = {
    indigo: "bg-primary",
    emerald: "bg-success",
    amber: "bg-warning",
    rose: "bg-danger",
    slate: "bg-fg-subtle",
    cyan: "bg-info",
    /* eslint-disable no-restricted-syntax -- categorical colours with no semantic token */
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    /* eslint-enable no-restricted-syntax */
    gold: "bg-warning",
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
