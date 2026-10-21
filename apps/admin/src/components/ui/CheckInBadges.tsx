import React from "react";
import { Badge, type BadgeProps } from "./Badge";
import {
  getCheckInReasonConfig,
  getCheckInStatusConfig,
  type CheckInReason,
  type CheckInStatus,
} from "@/models/checkIn";

export interface CheckInReasonBadgeProps extends Omit<
  BadgeProps,
  "variant" | "color"
> {
  reason?: CheckInReason | string | null;
}

export const CheckInReasonBadge: React.FC<CheckInReasonBadgeProps> = ({
  reason,
  size = "sm",
  className,
  ...props
}) => {
  const config = getCheckInReasonConfig(reason);
  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
      title={config.description}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

export interface CheckInStatusBadgeProps extends Omit<
  BadgeProps,
  "variant" | "color"
> {
  status?: CheckInStatus | string | null;
}

export const CheckInStatusBadge: React.FC<CheckInStatusBadgeProps> = ({
  status,
  size = "sm",
  className,
  dot,
  ...props
}) => {
  const config = getCheckInStatusConfig(status);
  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={dot ?? config.dot}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};
