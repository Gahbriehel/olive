import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";
import { ILeaderboardResponse, ILeaderboardEntry } from "@olive/types";

interface UseLeaderboardOptions {
  autoRefresh?: boolean;
  intervalMs?: number;
}

export function useLeaderboard(
  eventId: string,
  options: UseLeaderboardOptions = {},
) {
  const { autoRefresh = false, intervalMs = 15000 } = options;

  const query = useQuery<ILeaderboardResponse>({
    queryKey: ["leaderboard", eventId],
    queryFn: () => webService.getLeaderboard(eventId),
    enabled: Boolean(eventId),
    refetchInterval: autoRefresh ? intervalMs : false,
    staleTime: 10000,
  });

  const leaderboard: ILeaderboardEntry[] = query.data?.leaderboard || [];

  return {
    ...query,
    eventTitle: query.data?.eventTitle,
    leaderboard,
  };
}
