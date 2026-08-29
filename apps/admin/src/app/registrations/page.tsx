"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { RegistrationsView } from "@/components/views/RegistrationsView";
import { IRegistration } from "@/types/dashboard";
import { exportToCsv } from "@/helpers/exportCsv";

export default function RegistrationsPage() {
  const { selectedEventId } = useDashboard();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [teamId, setTeamId] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const regParams = useMemo(
    () => ({
      eventId: selectedEventId,
      page,
      limit,
      search: search || undefined,
      status: status !== "All" ? status : undefined,
      teamId: teamId !== "All" ? teamId : undefined,
    }),
    [selectedEventId, page, limit, search, status, teamId],
  );

  const {
    registrations: apiRegistrations,
    meta,
    refetch,
    isLoading,
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
    Record<string, Partial<IRegistration>>
  >({});

  const registrations = useMemo(
    () =>
      initialRegistrations.map((r) =>
        overrides[r.id] ? { ...r, ...overrides[r.id] } : r,
      ),
    [initialRegistrations, overrides],
  );

  const handleSearchChange = React.useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
    setPage(1);
  };

  return (
    <RegistrationsView
      registrations={registrations}
      teams={teams}
      onExportCsv={() => exportToCsv(registrations)}
      meta={meta}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      search={search}
      onSearchChange={handleSearchChange}
      statusFilter={status}
      onStatusFilterChange={handleStatusChange}
      teamFilter={teamId}
      onTeamFilterChange={handleTeamChange}
      onRefetch={refetch}
      isLoading={isLoading}
    />
  );
}
