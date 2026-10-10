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
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { QrScannerModal } from "@/components/modals/QrScannerModal";
import {
  AttendanceRecord,
  CheckInMethod,
  IRegistration,
} from "@/types/dashboard";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { useListFilters } from "@/hooks/useListFilters";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { IS_STRICT_RBAC_RESTRICTED } from "@/config/features";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  EmptyState,
  QueryState,
  SkeletonList,
} from "@/components/ui/QueryState";

export default function AttendancePage() {
  const {
    selectedEventId,
    activeEvent,
    handleCheckIn: apiCheckIn,
    isQrScannerOpen,
    setIsQrScannerOpen,
    currentRole,
  } = useDashboard();

  const { page, setPage, limit, setLimit, search, setSearch, queryParams } =
    useListFilters({ searchDebounceMs: 500 });
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const regParams = useMemo(
    () => ({ ...queryParams, eventId: selectedEventId }),
    [queryParams, selectedEventId],
  );

  const {
    registrations: apiRegistrations,
    meta,
    isLoading,
    isError,
    error,
    refetch,
  } = useRegistrations(regParams);

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
      <PageHeader
        title="Event Attendance Terminal"
        description="Scanning terminal active at Registration Desks. Fast badge scanning and manual attendee search."
        actions={
          <>
            <RefreshButton onRefetch={refetch} />
            <Button
              variant="primary"
              onClick={() => setIsQrScannerOpen(true)}
              leftIcon={<QrCode className="w-5 h-5" />}
            >
              Launch Gate QR Scanner
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <StatsCardGroup>
        <StatsCard
          title="Total Registrations"
          value={totalReg.toLocaleString()}
          change="Event capacity pool"
          trend="neutral"
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
        <StatsCard
          title="Checked-In"
          value={checkedInCount.toLocaleString()}
          change={`${checkinPct}% check-in rate`}
          trend="up"
          icon={UserCheck}
          color="emerald"
          loading={isLoading}
        />
        <StatsCard
          title="Pending Check-in"
          value={pendingCount.toLocaleString()}
          change="Expected attendees"
          trend="neutral"
          icon={UserX}
          color="amber"
          loading={isLoading}
        />
        <StatsCard
          title="Check-in Rate"
          value={`${checkinPct}%`}
          change={`${checkedInCount} of ${totalReg}`}
          trend="up"
          icon={TrendingUp}
          color="cyan"
          loading={isLoading}
        />
      </StatsCardGroup>

      {/* Progress Bar Gauge */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-fg-muted">
                Live Attendance Goal Progress
              </p>
              <h3 className="text-2xl font-black text-fg mt-0.5">
                {checkedInCount.toLocaleString()}{" "}
                <span className="text-sm font-normal text-fg-muted">
                  / {totalReg.toLocaleString()} Registrants
                </span>
              </h3>
            </div>
            <span className="text-3xl font-black text-success-text">
              {checkinPct}%
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
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
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />

              <div className="space-y-2 max-h-72 overflow-y-auto">
                <QueryState
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  onRetry={() => refetch()}
                  resource="registrations"
                  isEmpty={registrations.length === 0}
                  loading={<SkeletonList rows={4} className="p-1" />}
                  empty={
                    <EmptyState
                      icon={Search}
                      title={
                        search.trim()
                          ? "No attendees match your search"
                          : "No registrations for this event"
                      }
                      className="py-8"
                    />
                  }
                >
                  {registrations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-subtle text-xs"
                    >
                      <div>
                        <p className="font-bold text-fg">{r.name}</p>
                        <p className="text-2xs text-fg-muted flex items-center gap-1">
                          <span>{r.registrationNumber} •</span>
                          <TruncatedTextWithCopy
                            text={r.email}
                            maxLength={24}
                            textClassName="text-2xs text-fg-muted"
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
                          loading={checkingInId === r.id}
                          disabled={!canExecuteCheckIn}
                          title={
                            !canExecuteCheckIn
                              ? "Only Super Admins can execute check-ins"
                              : undefined
                          }
                        >
                          Check-In
                        </Button>
                      )}
                    </div>
                  ))}
                </QueryState>
              </div>
            </CardContent>
          </div>

          {/* Pagination Controls inside Manual Check-in Card Footer */}
          {!isLoading && !isError && totalItems > 0 && (
            <Pagination
              className="p-4 border-t border-border-subtle"
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
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
              <EmptyState
                icon={UserCheck}
                title="No check-ins yet"
                description="Scanned and manual check-ins will appear here."
                className="py-8"
              />
            ) : (
              attendanceLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-subtle border border-border-subtle text-xs animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success-soft text-success-text font-bold flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-fg">{log.attendeeName}</p>
                      <p className="text-2xs text-fg-muted">
                        {log.method} • {log.checkedInBy}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <TeamBadge color={log.teamColor} className="mb-1">
                      {log.teamName}
                    </TeamBadge>
                    <p className="text-2xs text-fg-muted flex items-center gap-1 justify-end">
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
