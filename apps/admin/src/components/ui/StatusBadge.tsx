import React from "react";
import { Badge } from "./Badge";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  size?: "sm" | "md";
  className?: string;
  variant?: "indigo" | "emerald" | "amber" | "rose" | "slate" | "cyan";
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
  variant: customVariant,
  dot: customDot,
  ...props
}) => {
  if (!status) return null;

  const normalized = status.trim().toUpperCase();

  let variant: "indigo" | "emerald" | "amber" | "rose" | "slate" | "cyan" =
    "slate";
  let dot = false;
  let label = status;

  switch (normalized) {
    // Checked In / Active / Deliverable / Attended
    case "CHECKED-IN":
    case "CHECKED IN":
    case "CHECKED_IN":
    case "ACTIVE":
    case "DELIVERABLE":
    case "ATTENDED":
      variant = "emerald";
      dot = true;
      label =
        normalized === "DELIVERABLE"
          ? "Deliverable"
          : normalized === "ACTIVE"
            ? "Active"
            : normalized === "CHECKED_IN" ||
                normalized === "CHECKED IN" ||
                normalized === "CHECKED-IN"
              ? "Checked-In"
              : "Attended";
      break;

    // Draft / Visitor / Warning States
    case "DRAFT":
      variant = "amber";
      dot = true;
      label = "Draft";
      break;
    case "VISITOR":
    case "GUEST":
    case "PENDING":
      variant = "amber";
      dot = false;
      label =
        normalized === "VISITOR"
          ? "Visitor"
          : normalized === "GUEST"
            ? "Guest"
            : "Pending";
      break;

    // Bounced / Dropped / Complained / Cancelled / Inactive / Not Checked In
    case "BOUNCED":
    case "DROPPED":
    case "COMPLAINED":
    case "CANCELLED":
    case "INACTIVE":
    case "NOT CHECKED IN":
    case "NOT CHECKED-IN":
    case "NOT_CHECKED_IN":
      variant = "rose";
      dot =
        normalized === "CANCELLED" ||
        normalized === "INACTIVE" ||
        normalized === "BOUNCED" ||
        normalized === "DROPPED" ||
        normalized === "COMPLAINED";
      label =
        normalized === "BOUNCED"
          ? "Bounced"
          : normalized === "DROPPED"
            ? "Dropped"
            : normalized === "COMPLAINED"
              ? "Complained"
              : normalized === "CANCELLED"
                ? "Cancelled"
                : normalized === "INACTIVE"
                  ? "Inactive"
                  : "Not Checked In";
      break;

    // Confirmed / Registered / Completed / Member / Published
    case "CONFIRMED":
    case "REGISTERED":
      variant = "indigo";
      dot = true;
      label = normalized === "CONFIRMED" ? "Confirmed" : "Registered";
      break;
    case "PUBLISHED":
      variant = "emerald";
      dot = true;
      label = "Published";
      break;
    case "COMPLETED":
      variant = "indigo";
      dot = false;
      label = "Completed";
      break;
    case "MEMBER":
      variant = "indigo";
      dot = false;
      label = "Member";
      break;

    default:
      variant = "slate";
      dot = false;
      // Capitalize first letter of each word as fallback
      label = status
        .split(/[-_ ]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      break;
  }

  const finalVariant = customVariant || variant;
  const finalDot = customDot !== undefined ? customDot : dot;

  // Special case for PUBLISHED which has a pulsing dot
  if (normalized === "PUBLISHED" && !customVariant && customDot === undefined) {
    return (
      <Badge variant="emerald" size={size} className={className} {...props}>
        <span className="relative flex h-2 w-2 mr-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Published
      </Badge>
    );
  }

  return (
    <Badge
      variant={finalVariant}
      size={size}
      dot={finalDot}
      className={className}
      {...props}
    >
      {label}
    </Badge>
  );
};
