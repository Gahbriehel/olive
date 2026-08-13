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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    teams: apiTeams,
    meta,
    createTeam: apiCreateTeam,
    updateTeam: apiUpdateTeam,
    deleteTeam: apiDeleteTeam,
    isCreatingTeam,
    isUpdatingTeam,
    isDeletingTeam,
    refetch,
  } = useTeams({
    eventId: selectedEventId,
    search,
    page,
    limit,
  });

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

  const handleCreateTeam = async (data: { name: string; color: string }) => {
    if (!selectedEventId) return;
    try {
      await apiCreateTeam({
        eventId: selectedEventId,
        name: data.name,
        color: data.color,
      });
    } catch (err) {
      console.error("Failed to create team:", err);
    }
  };

  const handleUpdateTeam = async (
    id: string,
    data: { name: string; color: string },
  ) => {
    try {
      await apiUpdateTeam({
        id,
        payload: {
          eventId: selectedEventId,
          name: data.name,
          color: data.color,
        },
      });
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await apiDeleteTeam(id);
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

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

  const handleSearchChange = React.useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  return (
    <TeamsView
      teams={teams}
      registrations={registrations}
      meta={meta}
      search={search}
      onSearchChange={handleSearchChange}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setPage(1);
      }}
      onCreateTeam={handleCreateTeam}
      onUpdateTeam={handleUpdateTeam}
      onDeleteTeam={handleDeleteTeam}
      onReassignTeam={handleReassignTeam}
      isCreating={isCreatingTeam}
      isUpdating={isUpdatingTeam}
      isDeleting={isDeletingTeam}
      onRefetch={refetch}
    />
  );
}
