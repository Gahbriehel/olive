"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { QueryState, SkeletonCardGrid } from "@/components/ui/QueryState";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Input } from "@/components/FormElements/Input";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { GamesForm } from "@/components/Forms/GamesForm";
import { IGame } from "@/models/game";
import { adaptApiGameToGame } from "@/models/game";
import { adaptApiTeamToTeam } from "@/models/team";
import { useDashboard } from "@/context/DashboardContext";
import { useGames } from "@/hooks/useGames";
import { useTeams } from "@/hooks/useTeams";
import { useListFilters } from "@/hooks/useListFilters";
import { GameCard } from "./_components/GameCard";
import { GamesEmptyState } from "./_components/GamesEmptyState";
import { GamesStats } from "./_components/GamesStats";
import { ManageScoresModal } from "./_components/ManageScoresModal";
import { useScoreEditor } from "./_components/useScoreEditor";

export default function GamesPage() {
  const { selectedEventId } = useDashboard();

  const { page, setPage, limit, setLimit, search, setSearch, queryParams } =
    useListFilters({ searchDebounceMs: 500 });

  const [clearScoresTarget, setClearScoresTarget] = useState<IGame | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<IGame | null>(
    null,
  );
  const [deletingGame, setDeletingGame] = useState<IGame | null>(null);

  const {
    games: apiGames,
    meta,
    recordScore: apiRecordScore,
    updateScore: apiUpdateScore,
    clearGameScores: apiClearGameScores,
    createGame: apiCreateGame,
    updateGame: apiUpdateGame,
    deleteGame: apiDeleteGame,
    isCreatingGame,
    isUpdatingGame,
    isDeletingGame,
    isClearingScores,
    isLoading: isLoadingGames,
    isError: isGamesError,
    error: gamesError,
    refetchGames,
    refetch,
  } = useGames({ ...queryParams, eventId: selectedEventId });

  const {
    teams: apiTeams,
    isLoading: isLoadingTeams,
    isError: isTeamsError,
    error: teamsError,
    refetch: refetchTeams,
  } = useTeams(selectedEventId);

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const games = useMemo(
    () =>
      Array.isArray(apiGames)
        ? apiGames.map((g) => adaptApiGameToGame(g, teams))
        : [],
    [apiGames, teams],
  );

  const scoreEditor = useScoreEditor({
    teams,
    recordScore: apiRecordScore,
    updateScore: apiUpdateScore,
  });

  // Errors propagate so ConfirmActionModal can show them inline.
  const handleClearGameScores = async () => {
    if (!clearScoresTarget) return;
    await apiClearGameScores(clearScoresTarget.id);
    setClearScoresTarget(null);
    scoreEditor.close();
  };

  const handleCreateGame = async (data: {
    name: string;
    description?: string;
    maxScore: number;
  }) => {
    if (!selectedEventId) return;
    try {
      await apiCreateGame({
        eventId: selectedEventId,
        ...data,
      });
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  };

  const handleUpdateGame = async (
    id: string,
    data: { name: string; description?: string; maxScore: number },
  ) => {
    if (!selectedEventId) return;
    try {
      await apiUpdateGame({
        id,
        payload: {
          eventId: selectedEventId,
          ...data,
        },
      });
      setSelectedGameForEdit(null);
    } catch (err) {
      console.error("Failed to update game:", err);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await apiDeleteGame(id);
      setDeletingGame(null);
    } catch (err) {
      console.error("Failed to delete game:", err);
    }
  };

  const totalItems = meta?.total ?? games.length;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Youth Conference Games"
        description="Tournament competition list, point allocations, and score submissions."
        actions={
          <ListToolbar
            create={{
              label: "Create New Game",
              onClick: () => setIsCreateOpen(true),
            }}
            actions={[
              { title: "Refresh", fn: () => refetch() },
              {
                title: "Export CSV",
                fn: () =>
                  downloadCsvExport(
                    "/games/export",
                    {
                      eventId: selectedEventId || undefined,
                      search: queryParams.search,
                    },
                    `games-${new Date().toISOString().slice(0, 10)}.csv`,
                  ),
              },
            ]}
          />
        }
      />

      <GamesStats
        games={games}
        totalItems={totalItems}
        gamesLoading={isLoadingGames}
        teamCount={teams.length}
        teamsLoading={isLoadingTeams}
        teamsError={isTeamsError}
      />

      {/* Search */}
      <div className="w-full sm:w-72">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          aria-label="Search games"
          leftIcon={<Search className="w-4 h-4" />}
          className="h-9"
        />
      </div>

      {/* Games List */}
      <QueryState
        isLoading={isLoadingGames}
        isError={isGamesError}
        error={gamesError}
        onRetry={() => refetchGames()}
        resource="games"
        isEmpty={games.length === 0}
        loading={<SkeletonCardGrid count={4} className="xl:grid-cols-2" />}
        empty={
          <GamesEmptyState
            search={search}
            onClearSearch={() => setSearch("")}
            onCreate={() => setIsCreateOpen(true)}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={() => setSelectedGameForEdit(game)}
              onClearScores={() => setClearScoresTarget(game)}
              onDelete={() => setDeletingGame(game)}
              onManageScores={() => scoreEditor.open(game)}
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

      {/* Score Submission Modal */}
      <ManageScoresModal
        editor={scoreEditor}
        teams={teams}
        teamsLoading={isLoadingTeams}
        teamsError={isTeamsError}
        teamsErrorValue={teamsError}
        onRetryTeams={() => refetchTeams()}
        onClearScores={setClearScoresTarget}
      />

      {/* Clear Game Scores Confirmation Modal */}
      {clearScoresTarget && (
        <ConfirmActionModal
          display
          close={() => setClearScoresTarget(null)}
          fn={handleClearGameScores}
          actionName="Clear Scores"
          tone="danger"
          title={`Are you sure you want to clear all recorded scores for "${clearScoresTarget.name}"?`}
          loading={isClearingScores}
        />
      )}

      {/* Create Game Sidebar Modal */}
      <SidebarModal
        title="Create New Game"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <GamesForm
          onSubmit={handleCreateGame}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreatingGame}
        />
      </SidebarModal>

      {/* Edit Game Sidebar Modal */}
      <SidebarModal
        title="Edit Game"
        isOpen={!!selectedGameForEdit}
        onClose={() => setSelectedGameForEdit(null)}
      >
        {selectedGameForEdit && (
          <GamesForm
            initialValues={selectedGameForEdit}
            onSubmit={async (data) => {
              await handleUpdateGame(selectedGameForEdit.id, data);
            }}
            onDelete={async () => {
              await handleDeleteGame(selectedGameForEdit.id);
              setSelectedGameForEdit(null);
            }}
            onCancel={() => setSelectedGameForEdit(null)}
            isLoading={isUpdatingGame}
            isDeleting={isDeletingGame}
          />
        )}
      </SidebarModal>

      {/* Delete Game Confirmation Modal */}
      {deletingGame && (
        <ConfirmActionModal
          display={Boolean(deletingGame)}
          close={() => setDeletingGame(null)}
          actionName="delete"
          title={`Are you sure you want to delete ${deletingGame.name}?`}
          fn={async () => {
            await handleDeleteGame(deletingGame.id);
          }}
        />
      )}
    </div>
  );
}
