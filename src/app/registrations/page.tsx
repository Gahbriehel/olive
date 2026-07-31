"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { RegistrationsView } from "@/components/views/RegistrationsView";
import { Registration } from "@/types/dashboard";

export default function RegistrationsPage() {
  const { selectedEventId, handleExportCsv } = useDashboard();
  const regParams = useMemo(
    () => ({ eventId: selectedEventId }),
    [selectedEventId],
  );
  const { registrations: apiRegistrations } = useRegistrations(regParams);
  const { teams: apiTeams } = useTeams(selectedEventId);

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

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

  const registrations = useMemo(
    () =>
      initialRegistrations.map((r) =>
        overrides[r.id] ? { ...r, ...overrides[r.id] } : r,
      ),
    [initialRegistrations, overrides],
  );

  const handleReassignTeam = (regId: string, newTeamId: string) => {
    const targetTeam = teams.find((t) => t.id === newTeamId);
    if (!targetTeam) return;
    setOverrides((prev) => ({
      ...prev,
      [regId]: {
        assignedTeamId: targetTeam.id,
        assignedTeamName: targetTeam.name,
        assignedTeamColor: targetTeam.colorHex,
      },
    }));
  };

  return (
    <RegistrationsView
      registrations={registrations}
      teams={teams}
      onReassignTeam={handleReassignTeam}
      onExportCsv={() => handleExportCsv(registrations)}
    />
  );
}
