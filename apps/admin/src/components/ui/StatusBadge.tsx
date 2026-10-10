import { Badge, BadgeVariant } from "./Badge";

interface StatusBadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  status: string;
  size?: "sm" | "md";
  className?: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

interface StatusStyle {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
  /** Animated "live" dot (published content). */
  pulse?: boolean;
}

/** Single source of truth for how a backend status string is displayed. */
const STATUS_STYLES: Record<string, StatusStyle> = {
  // Positive / live
  ACTIVE: { label: "Active", variant: "emerald", dot: true },
  DELIVERABLE: { label: "Deliverable", variant: "emerald", dot: true },
  ATTENDED: { label: "Attended", variant: "emerald", dot: true },
  CHECKED_IN: { label: "Checked-In", variant: "emerald", dot: true },
  PUBLISHED: { label: "Published", variant: "emerald", pulse: true },
  LEADER: { label: "Leader", variant: "emerald" },

  // Pending / warning
  DRAFT: { label: "Draft", variant: "amber", dot: true },
  VISITOR: { label: "Visitor", variant: "amber" },
  GUEST: { label: "Guest", variant: "amber" },
  PENDING: { label: "Pending", variant: "amber" },

  // Negative / stopped
  BOUNCED: { label: "Bounced", variant: "rose", dot: true },
  DROPPED: { label: "Dropped", variant: "rose", dot: true },
  COMPLAINED: { label: "Complained", variant: "rose", dot: true },
  CANCELLED: { label: "Cancelled", variant: "rose", dot: true },
  INACTIVE: { label: "Inactive", variant: "rose", dot: true },
  NOT_CHECKED_IN: { label: "Not Checked In", variant: "rose" },

  // Informational
  CONFIRMED: { label: "Confirmed", variant: "indigo", dot: true },
  REGISTERED: { label: "Registered", variant: "indigo", dot: true },
  COMPLETED: { label: "Completed", variant: "indigo" },
  MEMBER: { label: "Member", variant: "indigo" },
  WORKER: { label: "Worker", variant: "cyan" },
};

/** "checked-in", "Checked In" and "CHECKED_IN" all resolve to CHECKED_IN. */
const normalize = (status: string) =>
  status
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const titleCase = (status: string) =>
  status
    .split(/[-_ ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
  variant: customVariant,
  dot: customDot,
  ...props
}) => {
  if (!status) return null;

  const style: StatusStyle = STATUS_STYLES[normalize(status)] ?? {
    label: titleCase(status),
    variant: "slate",
  };

  if (style.pulse && !customVariant && customDot === undefined) {
    return (
      <Badge
        variant={style.variant}
        size={size}
        className={className}
        {...props}
      >
        <span className="relative mr-1.5 flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {style.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant={customVariant ?? style.variant}
      size={size}
      dot={customDot ?? Boolean(style.dot || style.pulse)}
      className={className}
      {...props}
    >
      {style.label}
    </Badge>
  );
};
