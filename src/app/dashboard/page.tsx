"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardView } from "@/components/views/DashboardView";

export default function DashboardPage() {
  const router = useRouter();
  const {
    activeEvent,
    setIsQrScannerOpen,
    setIsCreateEventOpen,
    handleExportCsv,
  } = useDashboard();
  const { dashboardData, isLoading } = useDashboardData();

  return (
    <DashboardView
      activeEvent={activeEvent}
      dashboardData={dashboardData}
      isLoading={isLoading}
      onNavigate={(tab) => router.push(`/${tab}`)}
      onOpenQrScanner={() => setIsQrScannerOpen(true)}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onExportCsv={() => handleExportCsv()}
    />
  );
}
