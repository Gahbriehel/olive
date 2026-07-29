"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { RegistrationsView } from "@/components/views/RegistrationsView";

export default function RegistrationsPage() {
  const { registrations, teams, handleReassignTeam, handleExportCsv } =
    useDashboard();

  return (
    <RegistrationsView
      registrations={registrations}
      teams={teams}
      onReassignTeam={handleReassignTeam}
      onExportCsv={handleExportCsv}
    />
  );
}
