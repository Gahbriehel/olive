import React, { useState } from "react";
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
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { QrScannerModal } from "@/components/modals/QrScannerModal";
import {
  Registration,
  AttendanceRecord,
  CheckInMethod,
} from "@/types/dashboard";

interface AttendanceViewProps {
  registrations: Registration[];
  attendanceLog: AttendanceRecord[];
  onCheckInAttendee: (
    regId: string,
    method: "QR Scan" | "Manual Search",
  ) => Promise<void>;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  onRefetch?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  registrations,
  attendanceLog,
  onCheckInAttendee,
  isScannerOpen,
  setIsScannerOpen,
  onRefetch,
}) => {
  const [manualQuery, setManualQuery] = useState("");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const totalReg = registrations.length;
  const checkedInCount = registrations.filter(
    (r) => r.status === "Checked-In",
  ).length;
  const pendingCount = totalReg - checkedInCount;
  const checkinPct =
    totalReg > 0
      ? Math.min(Math.round((checkedInCount / totalReg) * 100), 100)
      : 0;

  const unCheckedInRegistrations = registrations.filter(
    (r) => r.status !== "Checked-In",
  );

  const handleSimulateScan = async (
    regId: string,
    method: CheckInMethod = "QR Scan",
  ) => {
    const target = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );
    if (target) {
      setCheckingInId(target.id);
      try {
        await onCheckInAttendee(target.id, method);
      } catch (error) {
        console.error("Failed to check in simulated scan:", error);
      } finally {
        setCheckingInId(null);
      }
    } else {
      try {
        await onCheckInAttendee(regId, method);
      } catch (error) {
        console.error("Failed to check in simulated scan:", error);
      }
    }
  };

  const handleManualCheckInSubmit = async (reg: Registration) => {
    setCheckingInId(reg.id);
    try {
      await onCheckInAttendee(reg.id, "Manual Search");
    } catch (error) {
      console.error("Failed to check in manually:", error);
    } finally {
      setCheckingInId(null);
    }
  };

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
            onRefetch={onRefetch}
            className="px-3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          />
          <Button
            variant="primary"
            onClick={() => setIsScannerOpen(true)}
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
          title="Checked-In Today"
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
        <Card>
          <CardHeader>
            <CardTitle>Manual Check-in Console</CardTitle>
            <CardDescription>
              Search for unregistered or forgotten badge attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by attendee name or reg number..."
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {registrations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No data available
                </div>
              ) : (
                registrations
                  .filter(
                    (r) =>
                      manualQuery === "" ||
                      r.name
                        .toLowerCase()
                        .includes(manualQuery.toLowerCase()) ||
                      r.registrationNumber
                        .toLowerCase()
                        .includes(manualQuery.toLowerCase()),
                  )
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {r.registrationNumber} • {r.email}
                        </p>
                      </div>
                      {r.status === "Checked-In" ? (
                        <Badge variant="emerald" size="sm">
                          Checked-In
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleManualCheckInSubmit(r)}
                          isLoading={checkingInId === r.id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                        >
                          Check-In
                        </Button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
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
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(token, method) => {
          handleSimulateScan(token, method);
        }}
        title="Gate Attendance QR Scanner"
        description="Scan attendee digital QR passes via camera, hardware barcode scanner, image upload, or manual code input."
        pendingRegistrations={unCheckedInRegistrations}
      />
    </div>
  );
};
