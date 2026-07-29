import React, { useState } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Camera,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Registration, AttendanceRecord } from "@/types/dashboard";

interface AttendanceViewProps {
  registrations: Registration[];
  attendanceLog: AttendanceRecord[];
  onCheckInAttendee: (
    regId: string,
    method: "QR Scan" | "Manual Search",
  ) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  registrations,
  attendanceLog,
  onCheckInAttendee,
  isScannerOpen,
  setIsScannerOpen,
}) => {
  const [manualQuery, setManualQuery] = useState("");
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(
    null,
  );

  const totalReg = 1248;
  const checkedInCount = 892 + (attendanceLog.length - 5);
  const checkinPct = Math.min(
    Math.round((checkedInCount / totalReg) * 100),
    100,
  );

  const unCheckedInRegistrations = registrations.filter(
    (r) => r.status !== "Checked-In",
  );

  const handleSimulateScan = (regId: string) => {
    onCheckInAttendee(regId, "QR Scan");
    const target = registrations.find((r) => r.id === regId);
    if (target) {
      setScanSuccessMessage(
        `SUCCESSFULLY CHECKED IN: ${target.name} (${target.assignedTeamName})`,
      );
      setTimeout(() => setScanSuccessMessage(null), 3000);
    }
  };

  const handleManualCheckInSubmit = (reg: Registration) => {
    onCheckInAttendee(reg.id, "Manual Search");
    setScanSuccessMessage(`MANUALLY CHECKED IN: ${reg.name}`);
    setTimeout(() => setScanSuccessMessage(null), 3000);
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
            Youth Conference 2026 Attendance
          </h1>
          <p className="text-xs text-slate-300">
            Scanning terminal active at Registration Desks 1 & 2. Fast badge
            scanning and manual attendee search.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsScannerOpen(true)}
          leftIcon={<QrCode className="w-5 h-5" />}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 shadow-lg"
        >
          Launch Interactive QR Camera Simulator
        </Button>
      </div>

      {/* Success Notification Alert */}
      {scanSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-3 animate-fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{scanSuccessMessage}</span>
        </div>
      )}

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
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
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
              {registrations
                .filter(
                  (r) =>
                    manualQuery === "" ||
                    r.name.toLowerCase().includes(manualQuery.toLowerCase()) ||
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
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        Check-In
                      </Button>
                    )}
                  </div>
                ))}
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
            {attendanceLog.map((log) => (
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
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Interactive QR Camera Simulator Modal */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="QR Code Camera Scanner Simulator"
        description="Simulate scanning attendee digital QR tickets at the registration desk"
      >
        <div className="space-y-4 text-xs">
          {/* Simulated Viewfinder View */}
          <div className="relative aspect-video rounded-2xl bg-black flex flex-col items-center justify-center text-white border-2 border-indigo-500/50 overflow-hidden">
            <Camera className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
            <p className="font-bold text-sm">Targeting Badge QR Code</p>
            <p className="text-[11px] text-slate-400">
              Align attendee mobile pass inside viewfinder
            </p>

            {/* Viewfinder crosshairs */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none" />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Simulate Scan for Pending Registrants:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {unCheckedInRegistrations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    handleSimulateScan(r.id);
                    setIsScannerOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({r.registrationNumber})
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: r.assignedTeamColor }}
                  >
                    {r.assignedTeamName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
