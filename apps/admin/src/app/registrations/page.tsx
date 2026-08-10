"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { RegistrationsView } from "@/components/views/RegistrationsView";
import { Registration } from "@/types/dashboard";
import { exportToCsv } from "@/helpers/exportCsv";

export default function RegistrationsPage() {
  const { selectedEventId } = useDashboard();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const regParams = useMemo(
    () => ({
      eventId: selectedEventId,
      page,
      limit,
      search: search || undefined,
    }),
    [selectedEventId, page, limit, search],
  );

  const {
    registrations: apiRegistrations,
    meta,
    refetch,
  } = useRegistrations(regParams);
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

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <RegistrationsView
      registrations={registrations}
      teams={teams}
      onReassignTeam={handleReassignTeam}
      onExportCsv={() => exportToCsv(registrations)}
      meta={meta}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      search={search}
      onSearchChange={handleSearchChange}
      onRefetch={refetch}
    />
  );
}
