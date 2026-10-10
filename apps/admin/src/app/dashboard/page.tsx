"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Gamepad2,
  Shield,
  Download,
  CalendarDays,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { NavTab } from "@/types/dashboard";
import {
  StatsCard,
  StatsCardColor,
  StatsCardGroup,
} from "@/components/ui/StatsCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState } from "@/components/ui/QueryState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { exportToCsv } from "@/helpers/exportCsv";
import { getCategoryColor, EventCategory } from "@/models/event";
import { UpcomingBirthdaysCard } from "@/components/dashboard/UpcomingBirthdaysCard";
import { RecentPeopleCard } from "@/components/dashboard/RecentPeopleCard";

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

  const handleNavigate = (tab: NavTab) => {
    router.push(`/${tab}`);
  };

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

          {/* Main Grid: Upcoming Birthdays (2 cols) & Sidebar (Recent People & Upcoming Events) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Birthdays (2 cols) */}
            <UpcomingBirthdaysCard
              birthdays={upcomingBirthdays}
              isLoading={isLoading}
              className="lg:col-span-2"
            />

            {/* Sidebar (1 col): Recent People & Upcoming Events */}
            <div className="space-y-4">
              <RecentPeopleCard />

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Upcoming Events</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate("events")}
                  >
                    Manage
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-border bg-subtle space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-36" />
                        </div>
                      ))}
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      title="No upcoming events"
                      className="py-8"
                    />
                  ) : (
                    upcomingEvents.map((event) => {
                      const categoryColor = getCategoryColor(
                        event.category as EventCategory,
                      );
                      return (
                        <button
                          key={event.id}
                          type="button"
                          className="event-card block w-full text-left p-3 rounded-xl border border-border bg-subtle hover:bg-muted transition-all cursor-pointer space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          <span className="flex items-center justify-between flex-wrap gap-1">
                            <span className="category-pill">
                              <Badge color={categoryColor} size="sm">
                                {event.category || "GENERAL"}
                              </Badge>
                            </span>
                            <span className="flex items-center gap-1.5">
                              {event.isFeatured && (
                                <span className="featured-star text-warning-text font-semibold text-2xs flex items-center gap-0.5">
                                  ★ Pinned on Website
                                </span>
                              )}
                              <Badge variant="slate" size="sm">
                                {new Date(event.startDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </Badge>
                            </span>
                          </span>
                          <span className="block text-xs font-bold text-fg">
                            {event.title}
                          </span>
                          <span className="block text-2xs text-fg-muted">
                            {event.requiresRegistration !== false
                              ? `Registrations: ${event.totalRegistrations ?? 0}`
                              : "Open Admission"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
