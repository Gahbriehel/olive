"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { adaptApiTeamToTeam } from "@/models/team";
import { LeaderboardView } from "@/components/views/LeaderboardView";

export default function LeaderboardPage() {
  const { selectedEventId } = useDashboard();
  const { teams: apiTeams } = useTeams(selectedEventId);
  const { leaderboard, isLoadingLeaderboard } = useGames(selectedEventId);

  const teams = React.useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  return (
    <LeaderboardView
      teams={teams}
      leaderboard={leaderboard}
      isLoading={isLoadingLeaderboard}
    />
  );
}
