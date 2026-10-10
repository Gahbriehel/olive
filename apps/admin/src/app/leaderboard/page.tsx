"use client";

import React from "react";
import { Trophy, Shield, ChevronUp } from "lucide-react";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { QueryState, EmptyState } from "@/components/ui/QueryState";
import { Card, CardContent } from "@/components/ui/Card";
import { useDashboard } from "@/context/DashboardContext";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { adaptApiTeamToTeam } from "@/models/team";
import { LeaderboardEntry } from "@/types/dashboard";
import { LeaderboardSkeleton, Podium } from "./_components/Podium";

export default function LeaderboardPage() {
  const { selectedEventId } = useDashboard();
  const {
    teams: apiTeams,
    isLoading: isLoadingTeams,
    isError: isTeamsError,
    error: teamsError,
    refetch: refetchTeams,
  } = useTeams(selectedEventId);
  const {
    leaderboard,
    refetch,
    isLoadingLeaderboard,
    isLeaderboardError,
    leaderboardError,
    refetchLeaderboard,
  } = useGames(selectedEventId);

  const teams = React.useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  // Sort teams by total points descending as fallback
  const sortedTeams = React.useMemo(
    () => [...teams].sort((a, b) => b.totalPoints - a.totalPoints),
    [teams],
  );

  const entries: LeaderboardEntry[] = React.useMemo(() => {
    if (leaderboard && leaderboard.length > 0) {
      return leaderboard.map((lb, idx) => {
        const matchingTeam = teams.find((t) => t.id === lb.teamId);
        const colorHex =
          lb.colorHex || lb.color || matchingTeam?.colorHex || "#6366F1";
        return {
          rank: lb.rank || idx + 1,
          teamId: lb.teamId,
          teamName: lb.teamName,
          teamColor: matchingTeam?.color || "Indigo",
          colorHex,
          totalPoints:
            lb.totalScore ?? lb.totalPoints ?? matchingTeam?.totalPoints ?? 0,
          gamesPlayed: lb.gamesPlayed || 3,
          rankChange: idx === 0 ? "up" : "same",
        };
      });
    }
    return sortedTeams.map((t, idx) => ({
      rank: idx + 1,
      teamId: t.id,
      teamName: t.name,
      teamColor: t.color,
      colorHex: t.colorHex,
      totalPoints: t.totalPoints,
      gamesPlayed: 3,
      rankChange: idx === 0 ? "up" : "same",
    }));
  }, [leaderboard, sortedTeams, teams]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Team Tournament Leaderboard"
        description="Live scores calculated automatically from games, and trivia."
        icon={Trophy}
        actions={
          <ListToolbar
            actions={[
              { title: "Refresh", fn: () => refetch() },
              ...(selectedEventId
                ? [
                    {
                      title: "Export CSV",
                      fn: () =>
                        downloadCsvExport(
                          `/leaderboard/${selectedEventId}/export`,
                          {},
                          `leaderboard-${selectedEventId}-${new Date().toISOString().slice(0, 10)}.csv`,
                        ),
                    },
                  ]
                : []),
            ]}
          />
        }
      />

      <QueryState
        isLoading={isLoadingTeams || isLoadingLeaderboard}
        isError={isTeamsError || isLeaderboardError}
        error={teamsError ?? leaderboardError}
        onRetry={() => {
          if (isTeamsError) refetchTeams();
          if (isLeaderboardError) refetchLeaderboard();
        }}
        resource="leaderboard"
        isEmpty={teams.length === 0}
        loading={<LeaderboardSkeleton />}
        empty={
          <div className="bg-surface rounded-2xl border border-border">
            <EmptyState
              icon={Trophy}
              title="No standings yet"
              description="Create teams and record game scores to see the leaderboard."
            />
          </div>
        }
      >
        <Podium entries={entries} />

        {/* Animated Ranking Cards List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-fg">Full Team Standings</h2>
          {entries.map((entry) => (
            <Card key={entry.teamId} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center bg-muted text-fg-secondary">
                    #{entry.rank}
                  </span>

                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: entry.colorHex }}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="min-w-0 truncate font-bold text-sm text-fg">
                      {entry.teamName}
                    </h3>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 text-right">
                  <div>
                    <p className="text-lg font-black font-mono text-fg leading-none">
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-2xs text-fg-muted mt-0.5">
                      Total Points
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-success-soft text-success-text font-bold flex items-center gap-0.5">
                    <ChevronUp className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
