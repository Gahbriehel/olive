import React from "react";
import { Trophy, Shield, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { ILeaderboardEntry } from "@/models/game";
import { Team, LeaderboardEntry } from "@/types/dashboard";

interface LeaderboardViewProps {
  teams?: Team[];
  leaderboard?: ILeaderboardEntry[];
  isLoading?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  teams = [],
  leaderboard = [],
}) => {
  // Sort teams by total points descending as fallback
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  const entries: LeaderboardEntry[] =
    leaderboard && leaderboard.length > 0
      ? leaderboard.map((lb, idx) => {
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
            captain:
              matchingTeam?.captain ||
              (lb.memberCount !== undefined
                ? `${lb.memberCount} Members`
                : "Team Lead"),
          };
        })
      : sortedTeams.map((t, idx) => ({
          rank: idx + 1,
          teamId: t.id,
          teamName: t.name,
          teamColor: t.color,
          colorHex: t.colorHex,
          totalPoints: t.totalPoints,
          gamesPlayed: 3,
          rankChange: idx === 0 ? "up" : "same",
          captain: t.captain || "Team Lead",
        }));

  const firstPlace = entries[0];
  const secondPlace = entries[1];
  const thirdPlace = entries[2];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-indigo-700 to-purple-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Official Youth Conference Tournament Standings
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Team Tournament Leaderboard
          </h1>
          <p className="text-xs text-amber-100">
            Live scores calculated automatically from arena games, trivia, and
            obstacle relays.
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          No data available
        </div>
      ) : (
        <>
          {/* Visual Podium graphic for Top 3 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-2xl mx-auto">
            {/* 2nd Place */}
            {secondPlace && (
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-lg mb-2 border-2 border-slate-300"
                  style={{ backgroundColor: secondPlace.colorHex }}
                >
                  2
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-center truncate max-w-full">
                  {secondPlace.teamName}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {secondPlace.totalPoints} pts
                </span>
                <div className="w-full h-28 sm:h-36 bg-slate-200 dark:bg-zinc-800 rounded-t-2xl mt-2 flex items-center justify-center font-black text-slate-400 text-xl">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {firstPlace && (
              <div className="flex flex-col items-center">
                <Trophy className="w-8 h-8 text-amber-400 mb-1 animate-pulse" />
                <div
                  className="w-16 h-16 rounded-2xl text-white font-black text-2xl flex items-center justify-center shadow-xl mb-2 ring-4 ring-amber-400/40"
                  style={{ backgroundColor: firstPlace.colorHex }}
                >
                  1
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 text-center truncate max-w-full">
                  {firstPlace.teamName}
                </span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                  {firstPlace.totalPoints} pts
                </span>
                <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-500/20 to-amber-500/40 border border-amber-500/30 rounded-t-2xl mt-2 flex items-center justify-center font-black text-amber-600 dark:text-amber-300 text-2xl shadow-lg">
                  1st
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shadow-lg mb-2 border-2 border-amber-600/40"
                  style={{ backgroundColor: thirdPlace.colorHex }}
                >
                  3
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-center truncate max-w-full">
                  {thirdPlace.teamName}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {thirdPlace.totalPoints} pts
                </span>
                <div className="w-full h-24 sm:h-28 bg-slate-200 dark:bg-zinc-800 rounded-t-2xl mt-2 flex items-center justify-center font-black text-slate-400 text-xl">
                  3rd
                </div>
              </div>
            )}
          </div>

          {/* Animated Ranking Cards List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Full Team Standings
            </h3>
            {entries.map((entry) => (
              <Card
                key={entry.teamId}
                className="hover:shadow-md transition-all"
              >
                <CardContent className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                      #{entry.rank}
                    </span>

                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: entry.colorHex }}
                      >
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {entry.teamName}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Captain: {entry.captain} • {entry.gamesPlayed} Games
                          Played
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 leading-none">
                        {entry.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Total Points
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-0.5">
                      <ChevronUp className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
