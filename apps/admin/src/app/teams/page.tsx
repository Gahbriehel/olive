"use client";

import React, { useState, useMemo } from "react";
import { Shield, Users, Search, SearchX, Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  QueryState,
  EmptyState,
  SkeletonCardGrid,
} from "@/components/ui/QueryState";
import { TeamCard } from "./_components/TeamCard";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Input } from "@/components/FormElements/Input";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { TeamsForm } from "@/components/Forms/TeamsForm";
import { ITeam, adaptApiTeamToTeam } from "@/models/team";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { IRegistration } from "@/types/dashboard";
import { useDashboard } from "@/context/DashboardContext";
import { useTeams } from "@/hooks/useTeams";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useListFilters } from "@/hooks/useListFilters";

export default function TeamsPage() {
  const { selectedEventId } = useDashboard();

  const { page, setPage, limit, setLimit, search, setSearch, queryParams } =
    useListFilters({ searchDebounceMs: 500 });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<ITeam | null>(
    null,
  );
  const [deletingTeam, setDeletingTeam] = useState<ITeam | null>(null);

  const {
    teams: apiTeams,
    meta,
    createTeam: apiCreateTeam,
    updateTeam: apiUpdateTeam,
    deleteTeam: apiDeleteTeam,
    isCreatingTeam,
    isUpdatingTeam,
    isDeletingTeam,
    isLoading: isLoadingTeams,
    isError: isTeamsError,
    error: teamsError,
    refetch,
  } = useTeams({ ...queryParams, eventId: selectedEventId });

  const registrationsParams = useMemo(
    () => ({ eventId: selectedEventId, limit: 1000 }),
    [selectedEventId],
  );
  const {
    registrations: apiRegistrations,
    meta: registrationsMeta,
    isLoading: isLoadingRegistrations,
    isError: isRegistrationsError,
    refetch: refetchRegistrations,
  } = useRegistrations(registrationsParams);

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

  const [overrides] = useState<Record<string, Partial<IRegistration>>>({});

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
      setIsCreateOpen(false);
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
      setSelectedTeamForEdit(null);
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await apiDeleteTeam(id);
      setSelectedTeamForEdit(null);
      setDeletingTeam(null);
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  const totalItems = meta?.total ?? teams.length;
  const totalPages = meta?.totalPages ?? 1;
  const totalAllocated = registrationsMeta?.total ?? registrations.length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Event Teams"
        description="Create and manage event teams."
        actions={
          <ListToolbar
            create={{
              label: "Create New Team",
              onClick: () => setIsCreateOpen(true),
            }}
            actions={[
              { title: "Refresh", fn: () => refetch() },
              {
                title: "Export CSV",
                fn: () =>
                  downloadCsvExport(
                    "/teams/export",
                    {
                      eventId: selectedEventId || undefined,
                      search: queryParams.search,
                    },
                    `teams-${new Date().toISOString().slice(0, 10)}.csv`,
                  ),
              },
            ]}
          />
        }
      />

      {/* Metrics Grid */}
      <StatsCardGroup>
        <StatsCard
          title="Total Teams"
          value={isTeamsError ? "—" : totalItems.toLocaleString()}
          change="Teams created"
          trend="neutral"
          icon={Shield}
          color="indigo"
          loading={isLoadingTeams}
        />
        <StatsCard
          title="Allocated Members"
          value={isRegistrationsError ? "—" : totalAllocated.toLocaleString()}
          change={
            isRegistrationsError
              ? "Couldn't load registrations"
              : "Assigned to teams"
          }
          trend="up"
          icon={Users}
          color="emerald"
          loading={isLoadingRegistrations}
        />
      </StatsCardGroup>

      {isRegistrationsError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-danger-border bg-danger-soft text-xs text-danger-text"
        >
          <span>
            Couldn&apos;t load team members. Member lists below may be
            incomplete.
          </span>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => refetchRegistrations()}
          >
            Try again
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="w-full sm:w-72">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams by name..."
          aria-label="Search teams"
          leftIcon={<Search className="w-4 h-4" />}
          className="h-9"
        />
      </div>

      {/* Teams Grid */}
      <QueryState
        isLoading={isLoadingTeams}
        isError={isTeamsError}
        error={teamsError}
        onRetry={() => refetch()}
        resource="teams"
        isEmpty={teams.length === 0}
        loading={
          <SkeletonCardGrid
            count={4}
            className="xl:grid-cols-4 lg:grid-cols-4"
          />
        }
        empty={
          <div className="bg-surface rounded-2xl border border-border">
            {search ? (
              <EmptyState
                icon={SearchX}
                title="No teams match your search"
                description={`Nothing found for "${search}".`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Shield}
                title="No teams yet"
                description="Create teams to group attendees and track points."
                action={
                  <Button
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCreateOpen(true)}
                  >
                    Create team
                  </Button>
                }
              />
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              members={registrations.filter(
                (r) => r.assignedTeamId === team.id,
              )}
              onEdit={() => setSelectedTeamForEdit(team)}
              onDelete={() => setDeletingTeam(team)}
            />
          ))}
        </div>

        <Pagination
          className="p-4 bg-surface rounded-2xl border border-border shadow-sm"
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      </QueryState>

      {/* Create Team Sidebar Modal */}
      <SidebarModal
        title="Create New Team"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <TeamsForm
          onSubmit={handleCreateTeam}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreatingTeam}
        />
      </SidebarModal>

      {/* Edit Team Sidebar Modal */}
      <SidebarModal
        title="Edit Team"
        isOpen={!!selectedTeamForEdit}
        onClose={() => setSelectedTeamForEdit(null)}
      >
        {selectedTeamForEdit && (
          <TeamsForm
            initialValues={{
              id: selectedTeamForEdit.id,
              name: selectedTeamForEdit.name,
              color: selectedTeamForEdit.colorHex,
            }}
            onSubmit={(data) => handleUpdateTeam(selectedTeamForEdit.id, data)}
            onDelete={() => handleDeleteTeam(selectedTeamForEdit.id)}
            onCancel={() => setSelectedTeamForEdit(null)}
            isLoading={isUpdatingTeam}
            isDeleting={isDeletingTeam}
          />
        )}
      </SidebarModal>

      {/* Delete Team Confirmation Modal */}
      {deletingTeam && (
        <ConfirmActionModal
          display={Boolean(deletingTeam)}
          close={() => setDeletingTeam(null)}
          actionName="delete"
          title={`Are you sure you want to delete ${deletingTeam.name}?`}
          fn={() => handleDeleteTeam(deletingTeam.id)}
        />
      )}
    </div>
  );
}
