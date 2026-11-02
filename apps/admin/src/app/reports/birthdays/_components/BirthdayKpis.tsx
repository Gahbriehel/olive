"use client";

import { useMemo } from "react";
import { MailCheck, Clock, AlertCircle, Percent, Users } from "lucide-react";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { BirthdayAnalyticsResponse } from "@/models/birthday";
import { monthName } from "../../_components/months";

interface BirthdayKpisProps {
  analytics?: BirthdayAnalyticsResponse | null;
  selectedYear: number;
  selectedMonth: number | null;
  isLoading: boolean;
}

/** KPI cards summarising birthday outreach for the selected cycle. */
export function BirthdayKpis({
  analytics,
  selectedYear,
  selectedMonth,
  isLoading,
}: BirthdayKpisProps) {
  const kpiStats = useMemo(
    () => [
      {
        title: "Handling Rate",
        value: `${analytics?.handlingRate ?? 0}%`,
        description: selectedMonth
          ? `${monthName(selectedMonth)} coverage`
          : `${selectedYear} overall`,
        icon: Percent,
        color: "emerald" as const,
      },
      {
        title: "Total Birthdays",
        value: analytics?.totalBirthdays ?? 0,
        description: "Members in cycle",
        icon: Users,
        color: "indigo" as const,
      },
      {
        title: "Greeted (any channel)",
        value: analytics?.anyChannelSent ?? analytics?.completedCount ?? 0,
        description: "Delivered",
        icon: MailCheck,
        color: "cyan" as const,
      },
      {
        title: "WhatsApp Sent",
        value: analytics?.whatsappSent ?? 0,
        description: "Via WhatsApp",
        icon: WhatsAppIcon,
        color: "emerald" as const,
      },
      {
        title: "Pending",
        value: analytics?.pendingCount ?? 0,
        description: "Upcoming",
        icon: Clock,
        color: "amber" as const,
      },
      {
        title: "Missed",
        value: analytics?.missedCount ?? 0,
        description: "Ungreeted past",
        icon: AlertCircle,
        color: "rose" as const,
      },
    ],
    [analytics, selectedMonth, selectedYear],
  );

  return (
    <div className="w-full">
      <StatsCardGroup>
        {kpiStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} loading={isLoading} />
        ))}
      </StatsCardGroup>
    </div>
  );
}
