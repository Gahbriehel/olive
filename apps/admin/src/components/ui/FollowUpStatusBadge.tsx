import React from "react";
import { Badge, type BadgeVariant } from "./Badge";
import type { FollowUpStatus } from "@/models/person";

export interface FollowUpStatusBadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  status?: FollowUpStatus | string | null;
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
  label?: string;
}

interface FollowUpStyle {
  label: string;
  variant: BadgeVariant;
  dot: boolean;
}

/**
 * Standard status badges for Visitor Follow-up lifecycle:
 * - PENDING: Amber / Yellow (Needs Contact)
 * - IN_PROGRESS: Blue (In Contact)
 * - CONVERTED: Green / Emerald (Converted)
 * - INACTIVE: Gray / Slate (Inactive)
 * - null: None
 */
const FOLLOW_UP_STYLES: Record<string, FollowUpStyle> = {
  PENDING: { label: "Pending", variant: "amber", dot: true },
  IN_PROGRESS: { label: "In Progress", variant: "cyan", dot: true },
  CONVERTED: { label: "Converted", variant: "emerald", dot: true },
  INACTIVE: { label: "Inactive", variant: "slate", dot: true },
};

export const FollowUpStatusBadge: React.FC<FollowUpStatusBadgeProps> = ({
  status,
  size = "md",
  className,
  dot,
  label: customLabel,
  ...props
}) => {
  if (!status) {
    return <span className="text-fg-subtle select-none">—</span>;
  }

  const normalized = status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const style = FOLLOW_UP_STYLES[normalized] ?? {
    label: status,
    variant: "slate",
    dot: true,
  };

  return (
    <Badge
      variant={style.variant}
      size={size}
      dot={dot !== undefined ? dot : style.dot}
      className={className}
      {...props}
    >
      {customLabel ?? style.label}
    </Badge>
  );
};
