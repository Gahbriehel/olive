import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Users,
  Trophy,
  Scale,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightLeft,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input } from "@/components/ui/Input";
import { StatsCard } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { TeamsForm } from "@/components/Forms/TeamsForm";
import { Team } from "@/models/team";
import { Registration } from "@/types/dashboard";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

interface TeamsViewProps {
  teams: Team[];
  registrations?: Registration[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  search: string;
  onSearchChange: (search: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onCreateTeam: (data: { name: string; color: string }) => void | Promise<void>;
  onUpdateTeam: (
    id: string,
    data: { name: string; color: string },
  ) => void | Promise<void>;
  onDeleteTeam: (id: string) => void | Promise<void>;
  onReassignTeam?: (registrationId: string, newTeamId: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onRefetch?: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  registrations = [],
  meta,
  search,
  onSearchChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onReassignTeam,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  onRefetch,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<Team | null>(
    null,
  );
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedSearch(searchInput, 500);

  const onSearchChangeRef = React.useRef(onSearchChange);
  const prevDebouncedSearchRef = React.useRef(debouncedSearch);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  useEffect(() => {
    if (
      onSearchChangeRef.current &&
      prevDebouncedSearchRef.current !== debouncedSearch
    ) {
      prevDebouncedSearchRef.current = debouncedSearch;
      onSearchChangeRef.current(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-team-menu]")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  // Pagination calculation
  const totalItems = meta?.total ?? teams.length;
  const totalPages = meta?.totalPages ?? 1;
  const displayedTeams = teams;

  const totalAllocated = registrations.length;
  const highestPointsTeam = teams.reduce(
    (max, t) => (t.totalPoints > max.totalPoints ? t : max),
    teams[0] || { name: "N/A", totalPoints: 0 },
  );
  const avgPoints =
    teams.length > 0
      ? (
          teams.reduce((sum, t) => sum + t.totalPoints, 0) / teams.length
        ).toFixed(1)
      : "0";

  const handleQuickMove = (regId: string, currentTeamId: string) => {
    if (!onReassignTeam || teams.length === 0) return;
    const teamIds = teams.map((t) => t.id);
    const currIdx = teamIds.indexOf(currentTeamId);
    const nextTeamId = teamIds[(currIdx + 1) % teamIds.length];
    onReassignTeam(regId, nextTeamId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Event Teams & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create and manage conference teams, track scores, and balance roster
            member allocations.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <RefreshButton onRefetch={onRefetch} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Teams"
          value={totalItems.toLocaleString()}
          change="Tournament divisions"
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
        <StatsCard
          title="Leader Team"
          value={highestPointsTeam.name}
          change={`${highestPointsTeam.totalPoints} total points`}
          trend="up"
          icon={Trophy}
          color="amber"
        />
        <StatsCard
          title="Average Score"
          value={`${avgPoints} pts`}
          change="Team performance average"
          trend="neutral"
          icon={Scale}
          color="cyan"
        />
      </div>

      {/* Search & Rows Per Page Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
            onChange={(e) => onLimitChange(Number(e.target.value))}
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

                        {/* Options Menu */}
                        <div className="relative" data-team-menu>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === team.id ? null : team.id,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === team.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 z-30 animate-fade-in text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTeamForEdit(team);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-left text-slate-700 dark:text-slate-300"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-500" />
                                Edit Team
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingTeam(team);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium text-left text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-zinc-800/60 mt-1 pt-2 rounded-t-none"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Delete Team
                              </button>
                            </div>
                          )}
                        </div>
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

                    {/* Member Roster Sample if available */}
                    {teamRegs.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          Roster Sample
                        </p>
                        {teamRegs.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                              {r.name}
                            </span>
                            {onReassignTeam && (
                              <button
                                onClick={() => handleQuickMove(r.id, team.id)}
                                className="px-2 py-1 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded text-[10px] font-mono hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors flex items-center gap-1"
                                title="Move to Next Team"
                              >
                                <ArrowRightLeft className="w-3 h-3" /> Move
                              </button>
                            )}
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
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Roster Reassignment Console (if registrations exist) */}
      {registrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Roster Reassignment Console</CardTitle>
            <CardDescription>
              Transfer registered attendees between event teams immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {registrations.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center justify-between hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {r.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {r.registrationNumber}
                    </p>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: r.assignedTeamColor }}
                    >
                      {r.assignedTeamName}
                    </span>
                  </div>
                  {onReassignTeam && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickMove(r.id, r.assignedTeamId)}
                      className="text-[11px] h-8"
                    >
                      Transfer ⇄
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Team Sidebar Modal */}
      <SidebarModal
        title="Create New Team"
        display={isCreateOpen}
        close={() => setIsCreateOpen(false)}
      >
        <TeamsForm
          onSubmit={async (data) => {
            await onCreateTeam(data);
            setIsCreateOpen(false);
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreating}
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
            onSubmit={async (data) => {
              await onUpdateTeam(selectedTeamForEdit.id, data);
              setSelectedTeamForEdit(null);
            }}
            onDelete={async () => {
              await onDeleteTeam(selectedTeamForEdit.id);
              setSelectedTeamForEdit(null);
            }}
            onCancel={() => setSelectedTeamForEdit(null)}
            isLoading={isUpdating}
            isDeleting={isDeleting}
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
          fn={async () => {
            await onDeleteTeam(deletingTeam.id);
            setDeletingTeam(null);
          }}
        />
      )}
    </div>
  );
};
