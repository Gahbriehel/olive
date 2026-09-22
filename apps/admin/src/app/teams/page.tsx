"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Shield,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
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
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export default function TeamsPage() {
  const { selectedEventId } = useDashboard();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
  } = useTeams({
    eventId: selectedEventId,
    search: debouncedSearch,
    page,
    limit,
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Event Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create and manage event teams.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <RefreshButton onRefetch={refetch} />
          <ExportCsvButton
            endpoint="/teams/export"
            params={{
              eventId: selectedEventId || undefined,
              search: debouncedSearch || undefined,
            }}
            fallbackFilename={`teams-${new Date().toISOString().slice(0, 10)}.csv`}
          />
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create New Team
          </Button>
        </div>
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

      {/* Search & Rows Per Page Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search teams by name..."
            className="pl-9 text-xs h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Rows per page:
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs py-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      {displayedTeams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
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
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {team.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
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
                      <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {teamRegs.length > 0
                          ? teamRegs.length
                          : (team.memberCount ?? 0)}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          Members
                        </span>
                      </h3>
                    </div>

                    {teamRegs.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        {teamRegs.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
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
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {Math.min((page - 1) * limit + 1, totalItems)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {Math.min(page * limit, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {totalItems}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs">
              Page{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {totalPages}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        display={isCreateOpen}
        close={() => setIsCreateOpen(false)}
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
        display={!!selectedTeamForEdit}
        close={() => setSelectedTeamForEdit(null)}
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
