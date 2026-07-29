"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { AttendanceView } from "@/components/views/AttendanceView";

export default function AttendancePage() {
  const {
    registrations,
    attendanceLog,
    handleCheckIn,
    isQrScannerOpen,
    setIsQrScannerOpen,
  } = useDashboard();

  return (
    <AttendanceView
      registrations={registrations}
      attendanceLog={attendanceLog}
      onCheckInAttendee={handleCheckIn}
      isScannerOpen={isQrScannerOpen}
      setIsScannerOpen={setIsQrScannerOpen}
    />
  );
}
