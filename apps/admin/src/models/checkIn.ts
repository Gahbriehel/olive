import type {
  CheckInReason,
  CheckInStatus,
  IPastoralCheckIn,
  IPastoralCheckInUserSummary,
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
} from "@olive/types";
import type { BadgeVariant } from "@/components/ui/Badge";

export type {
  CheckInReason,
  CheckInStatus,
  IPastoralCheckIn,
  IPastoralCheckInUserSummary,
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
};

export interface CheckInReasonConfig {
  label: string;
  description: string;
  variant: BadgeVariant;
}

export const CHECK_IN_REASONS: Record<CheckInReason, CheckInReasonConfig> = {
  ABSENTEEISM: {
    label: "Absenteeism",
    description: "Missed services / sudden absence",
    variant: "amber",
  },
  ILLNESS: {
    label: "Illness",
    description: "Hospitalized or recovering at home",
    variant: "rose",
  },
  BEREAVEMENT: {
    label: "Bereavement",
    description: "Loss in family",
    variant: "purple",
  },
  WORKER_WELFARE: {
    label: "Worker Welfare",
    description: "Burnout, scheduling, department welfare",
    variant: "cyan",
  },
  DISCIPLESHIP: {
    label: "Discipleship",
    description: "Spiritual growth, baptism, foundations class",
    variant: "indigo",
  },
  FAMILY_SUPPORT: {
    label: "Family Support",
    description: "Marital, parental, or family needs",
    variant: "emerald",
  },
  GENERAL_CHECK_IN: {
    label: "General Check-in",
    description: "Routine pastoral care",
    variant: "slate",
  },
};

export const CHECK_IN_REASON_KEYS = Object.keys(
  CHECK_IN_REASONS,
) as CheckInReason[];

export interface CheckInStatusConfig {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
}

export const CHECK_IN_STATUSES: Record<CheckInStatus, CheckInStatusConfig> = {
  SCHEDULED: {
    label: "Scheduled",
    variant: "amber",
    dot: true,
  },
  COMPLETED: {
    label: "Completed",
    variant: "emerald",
    dot: true,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "slate",
    dot: false,
  },
};

export function getCheckInReasonConfig(
  reason?: string | null,
): CheckInReasonConfig {
  if (!reason) {
    return {
      label: "General Check-in",
      description: "Routine pastoral care",
      variant: "slate",
    };
  }
  const normalized = reason.trim().toUpperCase() as CheckInReason;
  return (
    CHECK_IN_REASONS[normalized] || {
      label: reason,
      description: "",
      variant: "slate",
    }
  );
}

export function getCheckInStatusConfig(
  status?: string | null,
): CheckInStatusConfig {
  if (!status) {
    return {
      label: "Scheduled",
      variant: "slate",
      dot: false,
    };
  }
  const normalized = status.trim().toUpperCase() as CheckInStatus;
  return (
    CHECK_IN_STATUSES[normalized] || {
      label: status,
      variant: "slate",
      dot: false,
    }
  );
}
