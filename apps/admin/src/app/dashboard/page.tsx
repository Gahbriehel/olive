"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Gamepad2, Shield, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import {
  StatsCard,
  StatsCardColor,
  StatsCardGroup,
} from "@/components/ui/StatsCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/QueryState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { exportToCsv } from "@/helpers/exportCsv";
import { UpcomingBirthdaysCard } from "@/components/dashboard/UpcomingBirthdaysCard";
import { RecentPeopleCard } from "@/components/dashboard/RecentPeopleCard";
import { TodaysOutreachCard } from "@/components/dashboard/TodaysOutreachCard";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";

export default function DashboardPage() {
  const router = useRouter();
  const { dashboardData, isLoading, isError, error, refetch } =
    useDashboardData();

  const overview = dashboardData?.overview;
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const upcomingBirthdays = dashboardData?.upcomingBirthdays || [];

  const totalPeople = overview?.totalPeople ?? 0;
  const visitors = overview?.totalVisitors ?? 0;
  const members = overview?.totalMembers ?? 0;
  const activeEventsCount = overview?.activeEvents ?? 0;

  const stats: Array<{
    title: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: React.ComponentType<{ className?: string }>;
    color: StatsCardColor;
  }> = [
    {
      title: "Total People",
      value: totalPeople.toLocaleString(),
      change: "",
      trend: "up",
      icon: Users,
      color: "indigo",
    },
    {
      title: "Visitors / First-Timers",
      value: visitors.toLocaleString(),
      change: `First-time guests`,
      trend: "neutral",
      icon: UserPlus,
      color: "amber",
    },
    {
      title: "Church Members",
      value: members.toLocaleString(),
      change: `Official members`,
      trend: "neutral",
      icon: Shield,
      color: "cyan",
    },
    {
      title: "Active Events",
      value: `${activeEventsCount}`,
      change: `Published events`,
      trend: "neutral",
      icon: Gamepad2,
      color: "rose",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Dashboard"
        description="Overview and analytics."
        actions={
          <>
            <RefreshButton onRefetch={refetch} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCsv()}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {isError ? (
        <Card>
          <ErrorState
            resource="dashboard data"
            error={error}
            onRetry={() => refetch()}
          />
        </Card>
      ) : (
        <>
          {/* Key Operational Metric Cards */}
          <StatsCardGroup>
            {stats.map((stat, idx) => (
              <StatsCard
                key={idx}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
                color={stat.color}
                loading={isLoading}
              />
            ))}
          </StatsCardGroup>

          {/* Row 1 (Priority #1): Upcoming Birthdays (2 cols) & Recent People (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <UpcomingBirthdaysCard
              birthdays={upcomingBirthdays}
              isLoading={isLoading}
              className="lg:col-span-2"
            />
            <RecentPeopleCard className="lg:col-span-1" />
          </div>

          {/* Row 2 (Priority #2): Today's Outreach (2 cols) & Upcoming Events (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TodaysOutreachCard className="lg:col-span-2" />
            <UpcomingEventsCard
              events={upcomingEvents}
              isLoading={isLoading}
              className="lg:col-span-1"
            />
          </div>
        </>
      )}
    </div>
  );
}
