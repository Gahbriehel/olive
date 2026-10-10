"use client";

import { useMemo } from "react";
import {
  MailWarning,
  AlertTriangle,
  CheckCircle2,
  Percent,
  ShieldCheck,
} from "lucide-react";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { EmailBounceSummary } from "@/models/emailBounce";
import { AnalyticsErrorCard } from "../../_components/AnalyticsErrorCard";
import { monthName } from "../../_components/months";

interface BounceKpisProps {
  summary: EmailBounceSummary;
  selectedYear: number;
  selectedMonth: number | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

/** KPI cards for the bounce report, or the analytics error state. */
export function BounceKpis({
  summary,
  selectedYear,
  selectedMonth,
  isLoading,
  isError,
  error,
  onRetry,
}: BounceKpisProps) {
  const kpiStats = useMemo(
    () => [
      {
        title: "Delivery Rate",
        value: `${summary.deliveryRate}%`,
        description: `${selectedMonth ? monthName(selectedMonth) : selectedYear} delivery success`,
        icon: ShieldCheck,
        color: "emerald" as const,
      },
      {
        title: "Total Delivery Failures",
        value: summary.totalBounces,
        description: `Out of ${summary.totalSent.toLocaleString()} sent emails`,
        icon: MailWarning,
        color: "rose" as const,
      },
      {
        title: "Action Needed",
        value: summary.unresolvedBounces,
        description: "Pending address fix",
        icon: AlertTriangle,
        color: "amber" as const,
      },
      {
        title: "Resolved Rate",
        value: `${summary.resolutionRate}%`,
        description: `${summary.resolvedBounces} remediated`,
        icon: CheckCircle2,
        color: "indigo" as const,
      },
      {
        title: "Bounce Rate",
        value: `${summary.bounceRate}%`,
        description: "Target under 2.0%",
        icon: Percent,
        color: summary.bounceRate > 2 ? ("rose" as const) : ("cyan" as const),
        className: "col-span-2 sm:col-span-1",
      },
    ],
    [summary, selectedMonth, selectedYear],
  );

  if (isError) {
    return (
      <AnalyticsErrorCard
        resource="bounce analytics"
        error={error}
        onRetry={onRetry}
      />
    );
  }

  return (
    <StatsCardGroup>
      {kpiStats.map((kpi) => (
        <StatsCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          change={kpi.description}
          trend="neutral"
          icon={kpi.icon}
          color={kpi.color}
          className={kpi.className}
          loading={isLoading}
        />
      ))}
    </StatsCardGroup>
  );
}
