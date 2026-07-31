"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useTeams } from "@/hooks/useTeams";
import { useRegistrations } from "@/hooks/useRegistrations";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { TeamsView } from "@/components/views/TeamsView";
import { Registration } from "@/types/dashboard";

export default function TeamsPage() {
  const { selectedEventId } = useDashboard();
  const { teams: apiTeams } = useTeams(selectedEventId);
  const registrationsParams = useMemo(
    () => ({ eventId: selectedEventId }),
    [selectedEventId],
  );
  const { registrations: apiRegistrations } =
    useRegistrations(registrationsParams);

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
    <TeamsView
      teams={teams}
      registrations={registrations}
      onReassignTeam={handleReassignTeam}
    />
  );
}
