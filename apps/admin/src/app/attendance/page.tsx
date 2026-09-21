"use client";

import React, { useState, useMemo } from "react";
import {
  QrCode,
  Search,
  Clock,
  UserCheck,
  Users,
  UserX,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { Input } from "@/components/FormElements/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { QrScannerModal } from "@/components/modals/QrScannerModal";
import {
  AttendanceRecord,
  CheckInMethod,
  IRegistration,
} from "@/types/dashboard";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { IS_STRICT_RBAC_RESTRICTED } from "@/config/features";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiRegistrationToRegistration } from "@/models/registration";

export default function AttendancePage() {
  const {
    selectedEventId,
    activeEvent,
    handleCheckIn: apiCheckIn,
    isQrScannerOpen,
    setIsQrScannerOpen,
    currentRole,
  } = useDashboard();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const regParams = useMemo(
    () => ({
      eventId: selectedEventId,
      page,
      limit,
      search: debouncedSearch || undefined,
    }),
    [selectedEventId, page, limit, debouncedSearch],
  );

  const {
    registrations: apiRegistrations,
    meta,
    refetch,
  } = useRegistrations(regParams);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const initialRegistrations = useMemo(
    () =>
      Array.isArray(apiRegistrations)
        ? apiRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiRegistrations],
  );

  const [overrides, setOverrides] = useState<
    Record<string, Partial<IRegistration>>
  >({});
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);

  const registrations = useMemo(
    () =>
      initialRegistrations.map((r) =>
        overrides[r.id] ? { ...r, ...overrides[r.id] } : r,
      ),
    [initialRegistrations, overrides],
  );

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN]);
  const canExecuteCheckIn = IS_STRICT_RBAC_RESTRICTED ? isSuperAdmin : true;

  const handleCheckInAttendee = async (
    regId: string,
    method: CheckInMethod,
  ) => {
    const reg = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );

    if (reg) {
      await apiCheckIn(reg.token, method);
    }

    if (!reg || reg.status === "Checked-In") return;

    setOverrides((prev) => ({
      ...prev,
      [reg.id]: {
        status: "Checked-In",
        checkedInAt: new Date().toISOString(),
      },
    }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newLog: AttendanceRecord = {
      id: `log-${reg.id}-${now.getTime()}`,
      registrationId: reg.id,
      attendeeName: reg.name,
      registrationNumber: reg.registrationNumber,
      teamName: reg.team?.name || "",
      teamColor: reg.team?.colorHex || "",
      time: `${timeStr} Today`,
      method,
      checkedInBy: currentRole,
    };
    setAttendanceLog((prev) => [newLog, ...prev]);
  };

  const handleSimulateScan = async (
    regId: string,
    method: CheckInMethod = "QR Scan",
  ) => {
    if (!canExecuteCheckIn) return;
    const target = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );
    if (target) {
      setCheckingInId(target.id);
      try {
        await handleCheckInAttendee(target.id, method);
      } catch (error) {
        console.error("Failed to check in simulated scan:", error);
      } finally {
        setCheckingInId(null);
      }
    } else {
      try {
        await handleCheckInAttendee(regId, method);
      } catch (error) {
        console.error("Failed to check in simulated scan:", error);
      }
    }
  };

  const handleManualCheckInSubmit = async (reg: IRegistration) => {
    if (!canExecuteCheckIn) return;
    setCheckingInId(reg.id);
    try {
      await handleCheckInAttendee(reg.id, "Manual Search");
    } catch (error) {
      console.error("Failed to check in manually:", error);
    } finally {
      setCheckingInId(null);
    }
  };

  const totalReg =
    meta?.total ?? activeEvent?.registeredCount ?? registrations.length;
  const checkedInCount =
    activeEvent?.checkedInCount ??
    registrations.filter((r) => r.status === "Checked-In").length;
  const pendingCount = Math.max(0, totalReg - checkedInCount);
  const checkinPct =
    totalReg > 0
      ? Math.min(Math.round((checkedInCount / totalReg) * 100), 100)
      : 0;

  const totalItems = meta?.total ?? registrations.length;
  const totalPages =
    meta?.totalPages ?? (limit ? Math.ceil(totalItems / limit) : 1);

  const unCheckedInRegistrations = registrations.filter(
    (r) => r.status !== "Checked-In",
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
              Live Check-in Desk Terminal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Event Attendance Terminal
          </h1>
          <p className="text-xs text-slate-300">
            Scanning terminal active at Registration Desks. Fast badge scanning
            and manual attendee search.
          </p>
        </div>

        <div className="flex gap-2">
          <RefreshButton
            onRefetch={refetch}
            className="px-3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          />
          <Button
            variant="primary"
            onClick={() => setIsQrScannerOpen(true)}
            leftIcon={<QrCode className="w-5 h-5" />}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 shadow-lg"
          >
            Launch Gate QR Scanner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registrations"
          value={totalReg.toLocaleString()}
          change="Event capacity pool"
          trend="neutral"
          icon={Users}
          color="indigo"
        />
        <StatsCard
          title="Checked-In"
          value={checkedInCount.toLocaleString()}
          change={`${checkinPct}% check-in rate`}
          trend="up"
          icon={UserCheck}
          color="emerald"
        />
        <StatsCard
          title="Pending Check-in"
          value={pendingCount.toLocaleString()}
          change="Expected attendees"
          trend="neutral"
          icon={UserX}
          color="amber"
        />
        <StatsCard
          title="Check-in Rate"
          value={`${checkinPct}%`}
          change={`${checkedInCount} of ${totalReg}`}
          trend="up"
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      {/* Progress Bar Gauge */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Live Attendance Goal Progress
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {checkedInCount.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-400">
                  / {totalReg.toLocaleString()} Registrants
                </span>
              </h3>
            </div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {checkinPct}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${checkinPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid: Manual Check-In Console & Real-time Live Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Search & Quick Check-in Bar */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Manual Check-in Console</CardTitle>
              <CardDescription>
                Search for unregistered or forgotten badge attendees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search by attendee name or reg number..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {registrations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No data available
                  </div>
                ) : (
                  registrations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{r.registrationNumber} •</span>
                          <TruncatedTextWithCopy
                            text={r.email}
                            maxLength={24}
                            textClassName="text-[10px] text-slate-400"
                          />
                        </p>
                      </div>
                      {r.status === "Checked-In" ? (
                        <StatusBadge status="Checked-In" size="sm" />
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleManualCheckInSubmit(r)}
                          isLoading={checkingInId === r.id}
                          disabled={!canExecuteCheckIn}
                          title={
                            !canExecuteCheckIn
                              ? "Only Super Admins can execute check-ins"
                              : undefined
                          }
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Check-In
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>

          {/* Pagination Controls inside Manual Check-in Card Footer */}
          {totalItems > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  Showing{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {Math.min((page - 1) * limit + 1, totalItems)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {Math.min(page * limit, totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {totalItems}
                  </span>
                </span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="ml-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs py-1 px-2 font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}/page
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs">
                  Page{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {totalPages}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Live Stream Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Check-in Stream</CardTitle>
            <CardDescription>Real-time log of scanned badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendanceLog.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No data available
              </div>
            ) : (
              attendanceLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-xs animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {log.attendeeName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {log.method} • {log.checkedInBy}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                      style={{ backgroundColor: log.teamColor }}
                    >
                      {log.teamName}
                    </span>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {log.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Functional Gate QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={(token, method) => {
          handleSimulateScan(token, method);
        }}
        title="Gate Attendance QR Scanner"
        description="Scan attendee digital QR passes via camera, hardware barcode scanner, image upload, or manual code input."
        pendingRegistrations={unCheckedInRegistrations}
      />
    </div>
  );
}
