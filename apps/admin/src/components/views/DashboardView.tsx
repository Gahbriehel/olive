import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  TrendingUp,
  Gamepad2,
  QrCode,
  Plus,
  Shield,
  Download,
  Clock,
  Sparkles,
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
import { Badge } from "@/components/ui/Badge";
import { NavTab, ChurchEvent } from "@/types/dashboard";
import { StatsCard, StatsCardColor } from "@/components/ui/StatsCard";
import { IDashboardData } from "@/models/dashboard";

interface DashboardViewProps {
  activeEvent?: ChurchEvent;
  dashboardData?: IDashboardData;
  isLoading?: boolean;
  onNavigate: (tab: NavTab) => void;
  onOpenQrScanner: () => void;
  onOpenCreateEvent?: () => void;
  onExportCsv?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeEvent,
  dashboardData,
  isLoading = false,
  onNavigate,
  onOpenQrScanner,
  onOpenCreateEvent = () => {},
  onExportCsv = () => {},
}) => {
  const overview = dashboardData?.overview;
  const latestRegistrations = dashboardData?.latestRegistrations || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  const totalReg = overview?.totalRegistrations ?? 0;
  const checkedIn = overview?.totalCheckInsToday ?? 0;
  const attendancePct = overview?.attendanceRate ?? 0;
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
      title: "Total Registrations",
      value: totalReg.toLocaleString(),
      change: `${activeEvent?.name || "Active Event"}`,
      trend: "up",
      icon: Users,
      color: "indigo",
    },
    {
      title: "Checked In Today",
      value: checkedIn.toLocaleString(),
      change: `${attendancePct}% attendance rate`,
      trend: "up",
      icon: UserCheck,
      color: "emerald",
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
      title: "Attendance Rate",
      value: `${attendancePct}%`,
      change: `${checkedIn} check-ins today`,
      trend: "up",
      icon: TrendingUp,
      color: "emerald",
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
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {activeEvent?.name
                ? `${activeEvent.name.toUpperCase()} LIVE`
                : "EVENT DASHBOARD"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Real-time event check-ins, registration throughput, and overview
            analytics.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenQrScanner}
            leftIcon={<QrCode className="w-4 h-4" />}
            className="bg-white text-indigo-950 hover:bg-slate-100 shadow-md font-semibold"
          >
            Scan QR Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
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
          onClick={onOpenCreateEvent}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Create Event
            </p>
            <p className="text-[11px] text-slate-400">
              New conference or retreat
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("teams")}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Assign Teams
            </p>
            <p className="text-[11px] text-slate-400">Rebalance teams</p>
          </div>
        </button>

        <button
          onClick={onOpenQrScanner}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Scan QR Code
            </p>
            <p className="text-[11px] text-slate-400">
              Live attendance check-in
            </p>
          </div>
        </button>

        <button
          onClick={onExportCsv}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Export CSV
            </p>
            <p className="text-[11px] text-slate-400">
              Download attendee roster
            </p>
          </div>
        </button>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <StatsCard
            key={idx}
            title={stat.title}
            value={isLoading ? "..." : stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

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
              onClick={() => onNavigate("registrations")}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="text-center p-6 text-sm text-slate-500">
                Loading latest registrations...
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
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {name}
                          </p>
                          <Badge
                            variant={
                              reg.person?.membershipStatus === "MEMBER"
                                ? "emerald"
                                : "amber"
                            }
                            size="sm"
                          >
                            {reg.person?.membershipStatus || "GUEST"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Reg #:{" "}
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {reg.registrationNumber}
                          </span>{" "}
                          • {reg.person?.email || "No Email"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {reg.team?.name && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1"
                          style={{
                            backgroundColor: reg.team.color || "#6366f1",
                          }}
                        >
                          {reg.team.name}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Upcoming Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("events")}
              >
                Manage
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  Loading upcoming events...
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  No data available
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {event.title}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {event.totalRegistrations} registered • {event.totalTeams}{" "}
                      teams
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick System Readiness */}
          <Card className="bg-gradient-to-br from-slate-900 to-zinc-900 text-white p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
                Registration Desk Mode
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Volunteers can use fast manual check-in or camera QR scanning on
              mobile tablets.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate("attendance")}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold"
            >
              Open Live Attendance Desk
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
