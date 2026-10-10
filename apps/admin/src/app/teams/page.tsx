"use client";

import React, { useState, useMemo } from "react";
import {
  Shield,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Input } from "@/components/FormElements/Input";
import { ActionsList } from "@/components/ui/ActionsList";
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
    refetch,
  } = useTeams({ ...queryParams, eventId: selectedEventId });

  const registrationsParams = useMemo(
    () => ({ eventId: selectedEventId, limit: 1000 }),
    [selectedEventId],
  );
  const { registrations: apiRegistrations, meta: registrationsMeta } =
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
  const displayedTeams = teams;
  const totalAllocated = registrationsMeta?.total ?? registrations.length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
          Event Teams
        </h1>
        <p className="text-xs sm:text-sm text-fg-muted">
          Create and manage event teams.
        </p>
      </div>

      {/* Metrics Grid */}
      <StatsCardGroup>
        <StatsCard
          title="Total Teams"
          value={totalItems.toLocaleString()}
          change="Teams created"
          trend="neutral"
          icon={Shield}
          color="indigo"
        />
        <StatsCard
          title="Allocated Members"
          value={totalAllocated.toLocaleString()}
          change="Assigned to teams"
          trend="up"
          icon={Users}
          color="emerald"
        />
      </StatsCardGroup>

      {/* Toolbar + Search & Rows Per Page Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
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

        <div className="flex items-center gap-3 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams by name..."
              className="pl-9 text-base h-9 bg-surface border-border focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-fg-muted font-medium">Rows:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-surface-raised border border-border-control rounded-lg text-base py-1.5 px-2.5 font-semibold text-fg-secondary focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {displayedTeams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-surface rounded-2xl border border-border">
          No teams available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedTeams.map((team) => {
            const teamRegs = registrations.filter(
              (r) => r.assignedTeamId === team.id,
            );
            return (
              <Card
                key={team.id}
                className="relative overflow-hidden border-t-4 flex flex-col justify-between"
                style={{ borderTopColor: team.colorHex }}
              >
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.colorHex }}
                        />
                        <span className="font-bold text-fg text-sm">
                          {team.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary-text">
                          {team.totalPoints} pts
                        </span>

                        <ActionsList
                          actions={[
                            {
                              title: "Edit Team",
                              fn: () => setSelectedTeamForEdit(team),
                            },
                            {
                              title: "Delete Team",
                              fn: () => setDeletingTeam(team),
                              destructive: true,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    <div>
                      <h3 className="text-xl font-black text-fg tracking-tight">
                        {teamRegs.length > 0
                          ? teamRegs.length
                          : (team.memberCount ?? 0)}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          Members
                        </span>
                      </h3>
                    </div>

                    {teamRegs.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                        {teamRegs.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-subtle text-xs"
                          >
                            <span className="font-semibold text-fg">
                              {r.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {totalItems > 0 && (
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-muted">
          <div>
            Showing{" "}
            <span className="font-semibold text-fg">
              {Math.min((page - 1) * limit + 1, totalItems)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-fg">
              {Math.min(page * limit, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-fg">{totalItems}</span>{" "}
            results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs">
              Page <span className="font-semibold text-fg">{page}</span> of{" "}
              <span className="font-semibold text-fg">{totalPages}</span>
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
