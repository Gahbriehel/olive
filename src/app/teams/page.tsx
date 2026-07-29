"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { TeamsView } from "@/components/views/TeamsView";

export default function TeamsPage() {
  const { teams, registrations, handleReassignTeam } = useDashboard();

  return (
    <TeamsView
      teams={teams}
      registrations={registrations}
      onReassignTeam={handleReassignTeam}
    />
  );
}
