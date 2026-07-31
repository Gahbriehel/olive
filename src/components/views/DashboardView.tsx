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
import {
  NavTab,
  Registration,
  ChurchEvent,
  Team,
  AttendanceRecord,
} from "@/types/dashboard";

import { StatsCard, StatsCardColor } from "@/components/ui/StatsCard";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardViewProps {
  activeEvent?: ChurchEvent;
  teams?: Team[];
  attendanceLog?: AttendanceRecord[];
  registrations: Registration[];
  onNavigate: (tab: NavTab) => void;
  onOpenQrScanner: () => void;
  onOpenCreateEvent?: () => void;
  onExportCsv?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeEvent,
  registrations,
  onNavigate,
  onOpenQrScanner,
  onOpenCreateEvent = () => {},
  onExportCsv = () => {},
}) => {
  const { events } = useDashboard();
  const totalReg = registrations.length;
  const checkedIn = registrations.filter(
    (r) => r.status === "Checked-In",
  ).length;
  const attendancePct =
    totalReg > 0 ? Math.round((checkedIn / totalReg) * 100) : 0;
  const visitors = registrations.filter(
    (r) => r.membershipStatus === "Visitor",
  ).length;
  const members = registrations.filter(
    (r) => r.membershipStatus === "Member",
  ).length;
  const visitorPct =
    totalReg > 0 ? ((visitors / totalReg) * 100).toFixed(1) : "0.0";
  const memberPct =
    totalReg > 0 ? ((members / totalReg) * 100).toFixed(1) : "0.0";

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
      change: `${attendancePct}% checked in`,
      trend: "up",
      icon: UserCheck,
      color: "emerald",
    },
    {
      title: "Visitors / First-Timers",
      value: visitors.toLocaleString(),
      change: `${visitorPct}% of total attendees`,
      trend: "neutral",
      icon: UserPlus,
      color: "amber",
    },
    {
      title: "Church Members",
      value: members.toLocaleString(),
      change: `${memberPct}% of total attendees`,
      trend: "neutral",
      icon: Shield,
      color: "cyan",
    },
    {
      title: "Attendance Rate",
      value: `${attendancePct}%`,
      change: `${checkedIn} of ${totalReg} checked in`,
      trend: "up",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Active Event Capacity",
      value: `${activeEvent?.registeredCount || totalReg} / ${activeEvent?.capacity || 0}`,
      change: `${activeEvent?.status || "Upcoming"} Status`,
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
            Real-time event check-ins, registration throughput, and team
            tournament scores.
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
            className="border-white/30 text-white hover:bg-white/10"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Action Bar (Minimal Clicks Operational SaaS Bar) */}
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
            <p className="text-[11px] text-slate-400">Rebalance 4 teams</p>
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
            value={stat.value}
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
                Real-time stream of incoming youth registrants
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
            {registrations.length === 0 ? (
              <div className="text-center p-6 text-sm text-slate-500">
                No data available
              </div>
            ) : (
              registrations.slice(0, 5).map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {reg.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {reg.name}
                        </p>
                        <Badge
                          variant={
                            reg.membershipStatus === "Member"
                              ? "emerald"
                              : "amber"
                          }
                          size="sm"
                        >
                          {reg.membershipStatus}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Reg #:{" "}
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {reg.registrationNumber}
                        </span>{" "}
                        • {reg.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1"
                      style={{ backgroundColor: reg.assignedTeamColor }}
                    >
                      {reg.assignedTeamName}
                    </span>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {reg.status === "Checked-In" ? "Checked In" : "Confirmed"}
                    </p>
                  </div>
                </div>
              ))
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
              {!events || events.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  No data available
                </div>
              ) : (
                events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {event.name}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      {event.registeredCount} of {event.capacity} spots
                      registered
                    </p>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{
                          width: `${Math.min((event.registeredCount / Math.max(event.capacity, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
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
