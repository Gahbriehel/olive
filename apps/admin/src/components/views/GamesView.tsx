import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Gamepad2,
  Award,
  Trophy,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/FormElements/Input";
import { ActionsList } from "@/components/ui/ActionsList";
import { StatsCard } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { GamesForm } from "@/components/Forms/GamesForm";
import { Game } from "@/models/game";
import { Team } from "@/models/team";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

interface GamesViewProps {
  games: Game[];
  teams: Team[];
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
  onCreateGame: (data: {
    name: string;
    description?: string;
    maxScore: number;
  }) => void | Promise<void>;
  onUpdateGame: (
    id: string,
    data: { name: string; description?: string; maxScore: number },
  ) => void | Promise<void>;
  onDeleteGame: (id: string) => void | Promise<void>;
  onAddScore: (
    gameId: string,
    scores: {
      teamId: string;
      points: number;
      scoreId?: string;
      notes?: string;
    }[],
  ) => void;
  onClearScores?: (gameId: string) => void | Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isClearingScores?: boolean;
  onRefetch?: () => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  teams,
  meta,
  search,
  onSearchChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onCreateGame,
  onUpdateGame,
  onDeleteGame,
  onAddScore,
  onClearScores,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  isClearingScores = false,
  onRefetch,
}) => {
  const [selectedGameForScore, setSelectedGameForScore] = useState<Game | null>(
    null,
  );
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [scoreNotes, setScoreNotes] = useState<Record<string, string>>({});
  const [scoreIds, setScoreIds] = useState<Record<string, string>>({});
  const [isConfirmClearScoresOpen, setIsConfirmClearScoresOpen] =
    useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGameForEdit, setSelectedGameForEdit] = useState<Game | null>(
    null,
  );
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);

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

  // Pagination calculation
  const totalItems = meta?.total ?? games.length;
  const totalPages = meta?.totalPages ?? 1;
  const displayedGames = games;

  const gamesWithScoresCount = games.filter(
    (g) => g.scores && g.scores.length > 0,
  ).length;
  const totalMaxPoints = games.reduce((sum, g) => sum + g.maxScore, 0);
  const totalTeams = teams.length;

  const handleOpenScoreModal = (game: Game) => {
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

  const handleSubmitScores = () => {
    if (selectedGameForScore) {
      const payload = Object.entries(scoreInputs).map(([teamId, points]) => ({
        teamId,
        points: Number(points),
        scoreId: scoreIds[teamId],
        notes: scoreNotes[teamId],
      }));
      onAddScore(selectedGameForScore.id, payload);
      setSelectedGameForScore(null);
    }
  };

  const handlePerformClearScores = async () => {
    if (selectedGameForScore && onClearScores) {
      await onClearScores(selectedGameForScore.id);
      setSelectedGameForScore(null);
      setIsConfirmClearScoresOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Youth Conference Games
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tournament competition list, point allocations, and score
            submissions.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <RefreshButton onRefetch={onRefetch} />
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create New Game
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Games"
          value={totalItems.toLocaleString()}
          change="Tournament schedule"
          trend="neutral"
          icon={Gamepad2}
          color="indigo"
        />
        <StatsCard
          title="Games Scored"
          value={`${gamesWithScoresCount} / ${games.length}`}
          change="Scores recorded"
          trend="up"
          icon={Award}
          color="emerald"
        />
        <StatsCard
          title="Max Point Pool"
          value={totalMaxPoints.toLocaleString()}
          change="Total points available"
          trend="neutral"
          icon={Trophy}
          color="cyan"
        />
        <StatsCard
          title="Participating Teams"
          value={totalTeams.toLocaleString()}
          change="Registered teams"
          trend="neutral"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Search & Rows Per Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search games..."
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

      {/* Games List */}
      {displayedGames.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedGames.map((game) => (
            <Card key={game.id} className="flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {game.name}
                    </CardTitle>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Max {game.maxScore} pts
                      </span>

                      <ActionsList
                        actions={[
                          {
                            title: "Edit Game",
                            fn: () => setSelectedGameForEdit(game),
                          },
                          ...(onClearScores &&
                          game.scores &&
                          game.scores.length > 0
                            ? [
                                {
                                  title: "Clear Scores",
                                  fn: () => {
                                    setSelectedGameForScore(game);
                                    setIsConfirmClearScoresOpen(true);
                                  },
                                  destructive: true,
                                },
                              ]
                            : []),
                          {
                            title: "Delete Game",
                            fn: () => setDeletingGame(game),
                            destructive: true,
                          },
                        ]}
                      />
                    </div>
                  </div>
                  {game.description && (
                    <CardDescription>{game.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Tournament Results
                    </p>
                    {game.scores.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {game.scores.map((s) => (
                          <div
                            key={s.teamId}
                            className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/60 font-semibold"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {s.teamColor && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: s.teamColor }}
                                />
                              )}
                              <span className="truncate">{s.teamName}</span>
                            </div>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 shrink-0 ml-1">
                              +{s.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">
                        No scores submitted yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => handleOpenScoreModal(game)}
                  leftIcon={<Edit3 className="w-4 h-4 text-indigo-500" />}
                >
                  Submit / Edit Game Scores
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls Bar - Always rendered when items exist */}
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

      {/* Score Submission Modal */}
      <Modal
        isOpen={!!selectedGameForScore}
        onClose={() => setSelectedGameForScore(null)}
        title={`Manage Scores: ${selectedGameForScore?.name}`}
        description={`Award or update team points for ${selectedGameForScore?.name} (Max Points: ${selectedGameForScore?.maxScore})`}
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {team.name}
                    </span>
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
                    <span className="text-slate-400 font-mono">pts</span>
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

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            {onClearScores ? (
              <Button
                variant="outline"
                color="danger"
                size="sm"
                onClick={() => setIsConfirmClearScoresOpen(true)}
              >
                Clear Scores
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedGameForScore(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitScores}>
                Save Game Scores
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Clear Game Scores Confirmation Modal */}
      {selectedGameForScore && (
        <ConfirmActionModal
          display={isConfirmClearScoresOpen}
          close={() => setIsConfirmClearScoresOpen(false)}
          fn={handlePerformClearScores}
          actionName="Clear Scores"
          title={`Are you sure you want to clear all recorded scores for "${selectedGameForScore.name}"?`}
          loading={isClearingScores}
        />
      )}

      {/* Create Game Sidebar Modal */}
      <SidebarModal
        title="Create New Game"
        display={isCreateOpen}
        close={() => setIsCreateOpen(false)}
      >
        <GamesForm
          onSubmit={async (data) => {
            await onCreateGame(data);
            setIsCreateOpen(false);
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreating}
        />
      </SidebarModal>

      {/* Edit Game Sidebar Modal */}
      <SidebarModal
        title="Edit Game"
        display={!!selectedGameForEdit}
        close={() => setSelectedGameForEdit(null)}
      >
        {selectedGameForEdit && (
          <GamesForm
            initialValues={selectedGameForEdit}
            onSubmit={async (data) => {
              await onUpdateGame(selectedGameForEdit.id, data);
              setSelectedGameForEdit(null);
            }}
            onDelete={async () => {
              await onDeleteGame(selectedGameForEdit.id);
              setSelectedGameForEdit(null);
            }}
            onCancel={() => setSelectedGameForEdit(null)}
            isLoading={isUpdating}
            isDeleting={isDeleting}
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
            await onDeleteGame(deletingGame.id);
            setDeletingGame(null);
          }}
        />
      )}
    </div>
  );
};
