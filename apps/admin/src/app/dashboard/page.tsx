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
import { useDashboard } from "@/context/DashboardContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { exportToCsv } from "@/helpers/exportCsv";
import { getCategoryColor, EventCategory } from "@/models/event";
import { UpcomingBirthdaysCard } from "@/components/dashboard/UpcomingBirthdaysCard";
import { TeamBadge } from "@/components/ui/TeamBadge";

export default function DashboardPage() {
  const router = useRouter();
  const { setIsQrScannerOpen, setIsCreateEventOpen } = useDashboard();
  const { dashboardData, isLoading, refetch } = useDashboardData();

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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-indigo-900 text-white shadow-xl relative overflow-hidden border border-indigo-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Overview and analytics.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <RefreshButton
            onRefetch={refetch}
            size="sm"
            className="px-2.5 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCsv()}
            leftIcon={<Download className="w-4 h-4" />}
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setIsCreateEventOpen(true)}
          className="p-4 rounded-2xl bg-surface border border-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-text flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-fg">Create Event</p>
            <p className="text-2xs text-slate-400">New conference or retreat</p>
          </div>
        </button>

        <button
          onClick={() => handleNavigate("teams")}
          className="p-4 rounded-2xl bg-surface border border-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-info-soft text-info-text flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-fg">Assign Teams</p>
            <p className="text-2xs text-slate-400">Rebalance teams</p>
          </div>
        </button>

        <button
          onClick={() => setIsQrScannerOpen(true)}
          className="p-4 rounded-2xl bg-surface border border-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-success-soft text-success-text flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-fg">Scan QR Code</p>
            <p className="text-2xs text-slate-400">Live attendance check-in</p>
          </div>
        </button>

        <button
          onClick={() => exportToCsv()}
          className="p-4 rounded-2xl bg-surface border border-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-warning-soft text-warning-text flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-fg">Export CSV</p>
            <p className="text-2xs text-slate-400">Download attendee roster</p>
          </div>
        </button>
      </div>

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
              <div className="text-center p-6 text-sm text-slate-500">
                No data available
              </div>
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
                          <p className="text-xs font-bold text-fg">{name}</p>
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
                      <p className="text-2xs text-slate-400 flex items-center gap-1 justify-end">
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
                <div className="text-center p-6 text-sm text-slate-500">
                  No data available
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const categoryColor = getCategoryColor(
                    event.category as EventCategory,
                  );
                  return (
                    <div
                      key={event.id}
                      className="event-card p-3 rounded-xl border border-border bg-subtle hover:bg-muted transition-all cursor-pointer space-y-1.5"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="category-pill">
                          <Badge color={categoryColor} size="sm">
                            {event.category || "GENERAL"}
                          </Badge>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {event.isFeatured && (
                            <span className="featured-star text-amber-500 font-semibold text-2xs flex items-center gap-0.5">
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
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-fg">
                        {event.title}
                      </h4>
                      <p className="text-2xs text-fg-muted">
                        {event.requiresRegistration !== false
                          ? `Registrations: ${event.totalRegistrations ?? 0}`
                          : "Open Admission"}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
