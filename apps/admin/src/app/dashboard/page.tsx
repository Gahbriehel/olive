"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Gamepad2,
  QrCode,
  Plus,
  Shield,
  Download,
  Clock,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NavTab } from "@/types/dashboard";
import {
  StatsCard,
  StatsCardColor,
  StatsCardGroup,
} from "@/components/ui/StatsCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState } from "@/components/ui/QueryState";
import { useDashboard } from "@/context/DashboardContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { exportToCsv } from "@/helpers/exportCsv";
import { getCategoryColor, EventCategory } from "@/models/event";
import { UpcomingBirthdaysCard } from "@/components/dashboard/UpcomingBirthdaysCard";
import { TeamBadge } from "@/components/ui/TeamBadge";

export default function DashboardPage() {
  const router = useRouter();
  const { setIsQrScannerOpen, setIsCreateEventOpen } = useDashboard();
  const { dashboardData, isLoading, isError, error, refetch } =
    useDashboardData();

  const overview = dashboardData?.overview;
  const latestRegistrations = dashboardData?.latestRegistrations || [];
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

  const quickActions: Array<{
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
    onClick: () => void;
  }> = [
    {
      label: "Create Event",
      description: "New conference or retreat",
      icon: Plus,
      iconClassName: "bg-primary-soft text-primary-text",
      onClick: () => setIsCreateEventOpen(true),
    },
    {
      label: "Assign Teams",
      description: "Rebalance teams",
      icon: Shield,
      iconClassName: "bg-info-soft text-info-text",
      onClick: () => handleNavigate("teams"),
    },
    {
      label: "Scan QR Code",
      description: "Live attendance check-in",
      icon: QrCode,
      iconClassName: "bg-success-soft text-success-text",
      onClick: () => setIsQrScannerOpen(true),
    },
    {
      label: "Export CSV",
      description: "Download attendee roster",
      icon: Download,
      iconClassName: "bg-warning-soft text-warning-text",
      onClick: () => exportToCsv(),
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

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(
          ({ label, description, icon: Icon, iconClassName, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="p-4 rounded-2xl bg-surface border border-border hover:border-primary-border hover:shadow-md transition-all flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary-border"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${iconClassName}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-fg">{label}</p>
                <p className="text-2xs text-fg-muted">{description}</p>
              </div>
            </button>
          ),
        )}
      </div>

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
          {/* 6 Key Operational Metric Cards */}
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

          {/* Main Grid: Latest Registrations Feed & Upcoming Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Registrations (2 cols) */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Latest Registrations</CardTitle>
                  <CardDescription>
                    Real-time stream of incoming registrants
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("registrations")}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-subtle"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Skeleton className="h-4 w-12 rounded-md" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestRegistrations.length === 0 ? (
                  <EmptyState
                    icon={UserPlus}
                    title="No registrations yet"
                    className="py-8"
                  />
                ) : (
                  latestRegistrations.map((reg) => {
                    const name =
                      `${reg.person?.firstName || ""} ${reg.person?.lastName || ""}`.trim() ||
                      "Attendee";
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-subtle hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-text font-bold text-xs flex items-center justify-center">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-fg">
                                {name}
                              </p>
                              <StatusBadge
                                status={reg.person?.membershipStatus || "GUEST"}
                                size="sm"
                              />
                            </div>
                            <p className="text-2xs text-fg-muted">
                              Reg #:{" "}
                              <span className="font-mono text-fg-secondary">
                                {reg.registrationNumber}
                              </span>{" "}
                              • {reg.person?.email || "No Email"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {reg.team?.name && (
                            <TeamBadge color={reg.team.color} className="mb-1">
                              {reg.team.name}
                            </TeamBadge>
                          )}
                          <p className="text-2xs text-fg-muted flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {reg.status === "CHECKED_IN"
                              ? "Checked In"
                              : "Registered"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events & Quick Stats */}
            <div className="space-y-4">
              <UpcomingBirthdaysCard
                birthdays={upcomingBirthdays}
                isLoading={isLoading}
              />

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
