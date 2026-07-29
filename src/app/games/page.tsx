"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { GamesView } from "@/components/views/GamesView";

export default function GamesPage() {
  const { games, teams, handleUpdateGameScores } = useDashboard();

  return (
    <GamesView
      games={games}
      teams={teams}
      onAddScore={handleUpdateGameScores}
    />
  );
}
