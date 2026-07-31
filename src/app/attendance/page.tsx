"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { AttendanceView } from "@/components/views/AttendanceView";
import {
  AttendanceRecord,
  CheckInMethod,
  Registration,
} from "@/types/dashboard";

export default function AttendancePage() {
  const {
    selectedEventId,
    handleCheckIn: apiCheckIn,
    isQrScannerOpen,
    setIsQrScannerOpen,
    currentRole,
  } = useDashboard();

  const regParams = useMemo(
    () => ({ eventId: selectedEventId }),
    [selectedEventId],
  );
  const { registrations: apiRegistrations } = useRegistrations(regParams);

  const initialRegistrations = useMemo(
    () =>
      Array.isArray(apiRegistrations)
        ? apiRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiRegistrations],
  );

  const [overrides, setOverrides] = useState<
    Record<string, Partial<Registration>>
  >({});
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);

  const registrations = useMemo(
    () =>
      initialRegistrations.map((r) =>
        overrides[r.id] ? { ...r, ...overrides[r.id] } : r,
      ),
    [initialRegistrations, overrides],
  );

  const handleCheckInAttendee = async (
    regId: string,
    method: CheckInMethod,
  ) => {
    const reg = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );

    if (reg) {
      await apiCheckIn(reg.registrationNumber, method);
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
      id: `log-${Date.now()}`,
      registrationId: reg.id,
      attendeeName: reg.name,
      registrationNumber: reg.registrationNumber,
      teamName: reg.assignedTeamName,
      teamColor: reg.assignedTeamColor,
      time: `${timeStr} Today`,
      method,
      checkedInBy: currentRole,
    };
    setAttendanceLog((prev) => [newLog, ...prev]);
  };

  return (
    <AttendanceView
      registrations={registrations}
      attendanceLog={attendanceLog}
      onCheckInAttendee={handleCheckInAttendee}
      isScannerOpen={isQrScannerOpen}
      setIsScannerOpen={setIsQrScannerOpen}
    />
  );
}
