"use client";

import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { useDashboard } from "@/context/DashboardContext";
import { useGames } from "@/hooks/useGames";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiGameToGame } from "@/models/game";
import { adaptApiTeamToTeam } from "@/models/team";
import { GamesView } from "@/components/views/GamesView";
import { Game } from "@/types/dashboard";

export default function GamesPage() {
  const { selectedEventId } = useDashboard();
  const { games: apiGames, recordScore: apiRecordScore } =
    useGames(selectedEventId);
  const { teams: apiTeams } = useTeams(selectedEventId);

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const initialGames = useMemo(
    () =>
      Array.isArray(apiGames)
        ? apiGames.map((g, idx) => adaptApiGameToGame(g, idx + 1))
        : [],
    [apiGames],
  );

  const [overrides, setOverrides] = useState<Record<string, Partial<Game>>>({});

  const games = useMemo(
    () =>
      initialGames.map((g) =>
        overrides[g.id] ? { ...g, ...overrides[g.id] } : g,
      ),
    [initialGames, overrides],
  );

  const handleUpdateGameScores = async (
    gameId: string,
    updatedScores: { teamId: string; points: number }[],
  ) => {
    for (const score of updatedScores) {
      try {
        await apiRecordScore({
          gameId,
          teamId: score.teamId,
          points: score.points,
        });
      } catch {
        // Handle error
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

    const currentGame = games.find((g) => g.id === gameId);
    if (currentGame) {
      const scores = currentGame.scores.map((s) => {
        const match = updatedScores.find((u) => u.teamId === s.teamId);
        return match ? { ...s, points: match.points } : s;
      });
      setOverrides((prev) => ({
        ...prev,
        [gameId]: { scores, status: "Completed" },
      }));
    }
  };

  return (
    <GamesView
      games={games}
      teams={teams}
      onAddScore={handleUpdateGameScores}
    />
  );
}
