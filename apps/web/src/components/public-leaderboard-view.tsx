"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Shield,
  RefreshCw,
  ArrowLeft,
  Users,
  Sparkles,
  Flame,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { ILeaderboardEntry, IApiEvent } from "@olive/types";

interface PublicLeaderboardViewProps {
  eventId: string;
  event?: IApiEvent | null;
}

export const PublicLeaderboardView: React.FC<PublicLeaderboardViewProps> = ({
  eventId,
  event,
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    leaderboard = [],
    eventTitle,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useLeaderboard(eventId, {
    autoRefresh,
    intervalMs: 15000,
  });

  const title = eventTitle || event?.title || "Tournament Leaderboard";

  // Process & sort leaderboard entries safely
  const sortedEntries: ILeaderboardEntry[] = [...leaderboard]
    .sort((a, b) => {
      const scoreA = a.totalScore ?? a.totalPoints ?? 0;
      const scoreB = b.totalScore ?? b.totalPoints ?? 0;
      return scoreB - scoreA;
    })
    .map((item, idx) => ({
      ...item,
      rank: item.rank || idx + 1,
      totalScore: item.totalScore ?? item.totalPoints ?? 0,
      colorHex: item.colorHex || item.color || "#6366F1",
    }));

  const firstPlace = sortedEntries[0];
  const secondPlace = sortedEntries[1];
  const thirdPlace = sortedEntries[2];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-44 rounded-3xl bg-white/5 border border-white/10" />
        <div className="grid grid-cols-3 gap-4 h-64 rounded-3xl bg-white/5 border border-white/10 max-w-2xl mx-auto" />
        <div className="space-y-4">
          <div className="h-16 rounded-2xl bg-white/5" />
          <div className="h-16 rounded-2xl bg-white/5" />
          <div className="h-16 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Leaderboard Unavailable
        </h1>
        <p className="text-sm text-slate-400">
          Unable to fetch current standings for this event. Please try again
          later.
        </p>
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>

        {/* Action controls */}
        <div className="flex items-center space-x-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
              autoRefresh
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Toggle 15s live auto-refresh"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? "bg-amber-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>Live Sync {autoRefresh ? "ON" : "OFF"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F1F1F] via-[#171717] to-[#0D0D0D] border border-amber-500/20 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Official Tournament Standings</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Live team scores and rankings updated in real time. Scores are
            calculated automatically from completed games and event activities.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {sortedEntries.length === 0 ? (
        <div className="p-12 text-center space-y-4 rounded-3xl bg-[#1F1F1F] border border-white/10">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Standings Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The leaderboard will populate as soon as games begin and scores are
            submitted by tournament coordinators.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top 3 Visual Podium Graphic */}
          <div className="pt-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto px-2">
              {/* 2ND PLACE */}
              {secondPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl text-white font-black text-base sm:text-xl flex items-center justify-center shadow-lg mb-2 border-2 border-slate-400/50"
                    style={{ backgroundColor: secondPlace.colorHex }}
                  >
                    2
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-full px-1">
                    {secondPlace.teamName}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 mt-0.5">
                    {secondPlace.totalScore} pts
                  </span>
                  <div className="w-full h-28 sm:h-36 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 rounded-t-2xl mt-3 flex flex-col items-center justify-center font-black text-slate-400 shadow-lg">
                    <span className="text-lg sm:text-2xl text-slate-300">
                      2nd
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Silver
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div />
              )}

              {/* 1ST PLACE */}
              {firstPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="flex flex-col items-center"
                >
                  <Trophy className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 mb-1 animate-bounce" />
                  <div
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-2xl mb-2 ring-4 ring-amber-400/40"
                    style={{ backgroundColor: firstPlace.colorHex }}
                  >
                    1
                  </div>
                  <span className="text-xs sm:text-base font-black text-amber-300 text-center truncate max-w-full px-1">
                    {firstPlace.teamName}
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-400 mt-0.5">
                    {firstPlace.totalScore} pts
                  </span>
                  <div className="w-full h-36 sm:h-48 bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-amber-950/40 border border-amber-500/40 rounded-t-2xl mt-3 flex flex-col items-center justify-center font-black text-amber-300 shadow-2xl">
                    <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xl sm:text-3xl text-amber-300">
                      1st
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                      Champion
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div />
              )}

              {/* 3RD PLACE */}
              {thirdPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl text-white font-black text-base sm:text-xl flex items-center justify-center shadow-lg mb-2 border-2 border-amber-700/50"
                    style={{ backgroundColor: thirdPlace.colorHex }}
                  >
                    3
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-full px-1">
                    {thirdPlace.teamName}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 mt-0.5">
                    {thirdPlace.totalScore} pts
                  </span>
                  <div className="w-full h-24 sm:h-28 bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/60 rounded-t-2xl mt-3 flex flex-col items-center justify-center font-black text-slate-400 shadow-lg">
                    <span className="text-base sm:text-xl text-amber-600">
                      3rd
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Bronze
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Full Rankings List */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>All Team Rankings</span>
              </h3>
              <span className="text-xs text-slate-400">
                {sortedEntries.length} Teams Competing
              </span>
            </div>

            <div className="space-y-3">
              {sortedEntries.map((entry, idx) => (
                <motion.div
                  key={entry.teamId || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl bg-[#1F1F1F] hover:bg-[#252525] border border-white/10 p-4 transition-all duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        entry.rank === 1
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                          : entry.rank === 2
                            ? "bg-slate-300/10 border border-slate-300/30 text-slate-200"
                            : entry.rank === 3
                              ? "bg-amber-800/20 border border-amber-800/40 text-amber-500"
                              : "bg-white/5 text-slate-400"
                      }`}
                    >
                      #{entry.rank}
                    </div>

                    {/* Team Color & Name */}
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shadow-md shrink-0"
                        style={{ backgroundColor: entry.colorHex }}
                      >
                        <Shield className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-white">
                          {entry.teamName}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                          {entry.memberCount !== undefined && (
                            <span className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>{entry.memberCount} Members</span>
                            </span>
                          )}
                          {entry.gamesPlayed !== undefined && (
                            <span>• {entry.gamesPlayed} Games</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-black font-mono text-white leading-none">
                      {(
                        entry.totalScore ??
                        entry.totalPoints ??
                        0
                      ).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-amber-400 mt-1">
                      Points
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
