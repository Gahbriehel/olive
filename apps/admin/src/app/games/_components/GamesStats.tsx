import { Award, Gamepad2, Trophy, Users } from "lucide-react";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { IGame } from "@/models/game";

interface GamesStatsProps {
  games: IGame[];
  totalItems: number;
  gamesLoading: boolean;
  teamCount: number;
  teamsLoading: boolean;
  teamsError: boolean;
}

export function GamesStats({
  games,
  totalItems,
  gamesLoading,
  teamCount,
  teamsLoading,
  teamsError,
}: GamesStatsProps) {
  const gamesWithScoresCount = games.filter(
    (g) => g.scores && g.scores.length > 0,
  ).length;
  const totalMaxPoints = games.reduce((sum, g) => sum + g.maxScore, 0);

  return (
    <StatsCardGroup>
      <StatsCard
        title="Total Games"
        value={totalItems.toLocaleString()}
        change="Tournament schedule"
        trend="neutral"
        icon={Gamepad2}
        color="indigo"
        loading={gamesLoading}
      />
      <StatsCard
        title="Games Scored"
        value={`${gamesWithScoresCount} / ${games.length}`}
        change="Scores recorded"
        trend="up"
        icon={Award}
        color="emerald"
        loading={gamesLoading}
      />
      <StatsCard
        title="Max Point Pool"
        value={totalMaxPoints.toLocaleString()}
        change="Total points available"
        trend="neutral"
        icon={Trophy}
        color="cyan"
        loading={gamesLoading}
      />
      <StatsCard
        title="Participating Teams"
        value={teamsError ? "—" : teamCount.toLocaleString()}
        change="Registered teams"
        trend="neutral"
        icon={Users}
        color="amber"
        loading={teamsLoading}
      />
    </StatsCardGroup>
  );
}
