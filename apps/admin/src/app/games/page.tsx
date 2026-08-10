"use client";

import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { useDashboard } from "@/context/DashboardContext";
import { useGames } from "@/hooks/useGames";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiGameToGame } from "@/models/game";
import { adaptApiTeamToTeam } from "@/models/team";
import { GamesView } from "@/components/views/GamesView";

export default function GamesPage() {
  const { selectedEventId } = useDashboard();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    refetch,
  } = useGames({
    eventId: selectedEventId,
    search,
    page,
    limit,
  });

  const { teams: apiTeams } = useTeams(selectedEventId);

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

  const handleUpdateGameScores = async (
    gameId: string,
    updatedScores: {
      teamId: string;
      points: number;
      scoreId?: string;
      notes?: string;
    }[],
  ) => {
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
  };

  const handleClearGameScores = async (gameId: string) => {
    try {
      await apiClearGameScores(gameId);
    } catch (err) {
      console.error("Failed to clear game scores:", err);
    }
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
    } catch (err) {
      console.error("Failed to update game:", err);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await apiDeleteGame(id);
    } catch (err) {
      console.error("Failed to delete game:", err);
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page on search
  };

  return (
    <GamesView
      games={games}
      teams={teams}
      meta={meta}
      search={search}
      onSearchChange={handleSearchChange}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when changing page limit
      }}
      onCreateGame={handleCreateGame}
      onUpdateGame={handleUpdateGame}
      onDeleteGame={handleDeleteGame}
      onAddScore={handleUpdateGameScores}
      onClearScores={handleClearGameScores}
      isCreating={isCreatingGame}
      isUpdating={isUpdatingGame}
      isDeleting={isDeletingGame}
      isClearingScores={isClearingScores}
      onRefetch={refetch}
    />
  );
}
