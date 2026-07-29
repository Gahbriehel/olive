"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { LeaderboardView } from "@/components/views/LeaderboardView";

export default function LeaderboardPage() {
  const { teams } = useDashboard();

  return <LeaderboardView teams={teams} />;
}
