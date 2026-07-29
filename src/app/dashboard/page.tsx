"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { DashboardView } from "@/components/views/DashboardView";

export default function DashboardPage() {
  const router = useRouter();
  const {
    activeEvent,
    teams,
    attendanceLog,
    registrations,
    setIsQrScannerOpen,
    setIsCreateEventOpen,
    handleExportCsv,
  } = useDashboard();

  return (
    <DashboardView
      activeEvent={activeEvent}
      teams={teams}
      attendanceLog={attendanceLog}
      registrations={registrations}
      onNavigate={(tab) => router.push(`/${tab}`)}
      onOpenQrScanner={() => setIsQrScannerOpen(true)}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onExportCsv={handleExportCsv}
    />
  );
}
