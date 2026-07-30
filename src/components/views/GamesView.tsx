import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Gamepad2,
  CheckCircle2,
  PlayCircle,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { StatsCard } from "@/components/ui/StatsCard";
import { Game, Team } from "@/types/dashboard";

interface GamesViewProps {
  games: Game[];
  teams: Team[];
  onAddScore: (
    gameId: string,
    scores: { teamId: string; points: number }[],
  ) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  games,
  teams,
  onAddScore,
}) => {
  const [selectedGameForScore, setSelectedGameForScore] = useState<Game | null>(
    null,
  );
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});

  const totalGames = games.length;
  const completedGames = games.filter((g) => g.status === "Completed").length;
  const inProgressGames = games.filter(
    (g) => g.status === "In Progress",
  ).length;
  const totalMaxPoints = games.reduce((sum, g) => sum + g.maxPoints, 0);

  const handleOpenScoreModal = (game: Game) => {
    setSelectedGameForScore(game);
    const initial: Record<string, number> = {};
    teams.forEach((t) => {
      const existing = game.scores.find((s) => s.teamId === t.id);
      initial[t.id] = existing ? existing.points : 0;
    });
    setScoreInputs(initial);
  };

  const handleSubmitScores = () => {
    if (selectedGameForScore) {
      const payload = Object.entries(scoreInputs).map(([teamId, points]) => ({
        teamId,
        points: Number(points),
      }));
      onAddScore(selectedGameForScore.id, payload);
      setSelectedGameForScore(null);
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
            Tournament competition list, point allocations, and game master
            score submissions.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Create New Game
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Games"
          value={totalGames.toLocaleString()}
          change="Tournament schedule"
          trend="neutral"
          icon={Gamepad2}
          color="indigo"
        />
        <StatsCard
          title="Completed Games"
          value={completedGames.toLocaleString()}
          change="Scores recorded"
          trend="up"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="In Progress"
          value={inProgressGames.toLocaleString()}
          change="Live competition"
          trend="neutral"
          icon={PlayCircle}
          color="amber"
        />
        <StatsCard
          title="Max Point Pool"
          value={totalMaxPoints.toLocaleString()}
          change="Total points available"
          trend="neutral"
          icon={Trophy}
          color="cyan"
        />
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="flex flex-col justify-between">
            <div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      game.status === "Completed"
                        ? "emerald"
                        : game.status === "In Progress"
                          ? "amber"
                          : "slate"
                    }
                    dot
                  >
                    {game.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Order #{game.order} • Max {game.maxPoints} pts
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-1">
                  {game.title}
                </CardTitle>
                <CardDescription>{game.category}</CardDescription>
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
                          className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-zinc-700 font-semibold"
                        >
                          <span className="truncate">{s.teamName}</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
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

      {/* Score Submission Modal */}
      <Modal
        isOpen={!!selectedGameForScore}
        onClose={() => setSelectedGameForScore(null)}
        title={`Submit Scores: ${selectedGameForScore?.title}`}
        description={`Award team points for order #${selectedGameForScore?.order} (Max Points: ${selectedGameForScore?.maxPoints})`}
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50"
              >
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
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
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
      </Modal>
    </div>
  );
};
