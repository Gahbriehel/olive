"use client";

import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Gamepad2,
  Award,
  Trophy,
  Users,
  Search,
  SearchX,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  QueryState,
  EmptyState,
  SkeletonCardGrid,
  SkeletonList,
} from "@/components/ui/QueryState";
import { GameCard } from "./_components/GameCard";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/FormElements/Input";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
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

export default function GamesPage() {
  const { selectedEventId } = useDashboard();

  const { page, setPage, limit, setLimit, search, setSearch, queryParams } =
    useListFilters({ searchDebounceMs: 500 });

  const [selectedGameForScore, setSelectedGameForScore] =
    useState<IGame | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [scoreNotes, setScoreNotes] = useState<Record<string, string>>({});
  const [scoreIds, setScoreIds] = useState<Record<string, string>>({});
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

  const handleUpdateGameScores = async () => {
    if (!selectedGameForScore) return;
    const gameId = selectedGameForScore.id;
    const updatedScores = Object.entries(scoreInputs).map(
      ([teamId, points]) => ({
        teamId,
        points: Number(points),
        scoreId: scoreIds[teamId],
        notes: scoreNotes[teamId],
      }),
    );

    for (const score of updatedScores) {
      try {
        if (score.scoreId) {
          await apiUpdateScore({
            id: score.scoreId,
            payload: {
              gameId,
              teamId: score.teamId,
              points: score.points,
              notes: score.notes,
            },
          });
        } else {
          await apiRecordScore({
            gameId,
            teamId: score.teamId,
            points: score.points,
            notes: score.notes,
          });
        }
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    setSelectedGameForScore(null);
  };

  // Errors propagate so ConfirmActionModal can show them inline.
  const handleClearGameScores = async () => {
    if (!clearScoresTarget) return;
    await apiClearGameScores(clearScoresTarget.id);
    setClearScoresTarget(null);
    setSelectedGameForScore(null);
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

  const handleOpenScoreModal = (game: IGame) => {
    setSelectedGameForScore(game);
    const initialPoints: Record<string, number> = {};
    const initialNotes: Record<string, string> = {};
    const initialIds: Record<string, string> = {};
    teams.forEach((t) => {
      const existing = game.scores.find((s) => s.teamId === t.id);
      initialPoints[t.id] = existing ? existing.points : 0;
      initialNotes[t.id] = existing?.notes || "";
      if (existing?.id) {
        initialIds[t.id] = existing.id;
      }
    });
    setScoreInputs(initialPoints);
    setScoreNotes(initialNotes);
    setScoreIds(initialIds);
  };

  const totalItems = meta?.total ?? games.length;
  const totalPages = meta?.totalPages ?? 1;

  const gamesWithScoresCount = games.filter(
    (g) => g.scores && g.scores.length > 0,
  ).length;
  const totalMaxPoints = games.reduce((sum, g) => sum + g.maxScore, 0);
  const totalTeams = teams.length;

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

      {/* Metrics Grid */}
      <StatsCardGroup>
        <StatsCard
          title="Total Games"
          value={totalItems.toLocaleString()}
          change="Tournament schedule"
          trend="neutral"
          icon={Gamepad2}
          color="indigo"
          loading={isLoadingGames}
        />
        <StatsCard
          title="Games Scored"
          value={`${gamesWithScoresCount} / ${games.length}`}
          change="Scores recorded"
          trend="up"
          icon={Award}
          color="emerald"
          loading={isLoadingGames}
        />
        <StatsCard
          title="Max Point Pool"
          value={totalMaxPoints.toLocaleString()}
          change="Total points available"
          trend="neutral"
          icon={Trophy}
          color="cyan"
          loading={isLoadingGames}
        />
        <StatsCard
          title="Participating Teams"
          value={isTeamsError ? "—" : totalTeams.toLocaleString()}
          change="Registered teams"
          trend="neutral"
          icon={Users}
          color="amber"
          loading={isLoadingTeams}
        />
      </StatsCardGroup>

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
          <div className="bg-surface rounded-2xl border border-border">
            {search ? (
              <EmptyState
                icon={SearchX}
                title="No games match your search"
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
                icon={Gamepad2}
                title="No games yet"
                description="Create a game to start recording team scores."
                action={
                  <Button
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsCreateOpen(true)}
                  >
                    Create game
                  </Button>
                }
              />
            )}
          </div>
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
              onManageScores={() => handleOpenScoreModal(game)}
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
      <Modal
        isOpen={!!selectedGameForScore}
        onClose={() => setSelectedGameForScore(null)}
        title={`Manage Scores: ${selectedGameForScore?.name}`}
        description={`Award or update team points for ${selectedGameForScore?.name} (Max Points: ${selectedGameForScore?.maxScore})`}
      >
        <div className="space-y-4 text-xs">
          <QueryState
            isLoading={isLoadingTeams}
            isError={isTeamsError}
            error={teamsError}
            onRetry={() => refetchTeams()}
            resource="teams"
            isEmpty={teams.length === 0}
            loading={<SkeletonList rows={3} />}
            empty={
              <EmptyState
                icon={Users}
                title="No teams yet"
                description="Create teams for this event before recording scores."
              />
            }
          >
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-3 rounded-xl border border-border bg-subtle space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.colorHex }}
                      />
                      <span className="font-bold text-fg">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={scoreInputs[team.id] ?? 0}
                        onChange={(e) =>
                          setScoreInputs({
                            ...scoreInputs,
                            [team.id]: Number(e.target.value),
                          })
                        }
                        className="w-24 text-right font-mono"
                      />
                      <span className="text-fg-muted font-mono">pts</span>
                    </div>
                  </div>
                  <Input
                    placeholder="Score notes (optional)..."
                    value={scoreNotes[team.id] || ""}
                    onChange={(e) =>
                      setScoreNotes({
                        ...scoreNotes,
                        [team.id]: e.target.value,
                      })
                    }
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </QueryState>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setClearScoresTarget(selectedGameForScore)}
            >
              Clear Scores
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedGameForScore(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateGameScores}>
                Save Game Scores
              </Button>
            </div>
          </div>
        </div>
      </Modal>

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
