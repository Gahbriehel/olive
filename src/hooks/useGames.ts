import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateGamePayload,
  IRecordScorePayload,
  IApiGame,
  ILeaderboardEntry,
} from "@/models/game";
import { gamesService } from "@/services/games.service";

const EMPTY_GAMES: IApiGame[] = [];
const EMPTY_LEADERBOARD: ILeaderboardEntry[] = [];

export function useGames(eventId?: string) {
  const queryClient = useQueryClient();

  const gamesQuery = useQuery({
    queryKey: ["games", eventId],
    queryFn: () => gamesService.getGames(eventId),
    staleTime: 1000 * 60,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", eventId],
    queryFn: () =>
      eventId ? gamesService.getLeaderboard(eventId) : EMPTY_LEADERBOARD,
    enabled: !!eventId,
    staleTime: 1000 * 15,
  });

  const createGameMutation = useMutation({
    mutationFn: (dto: ICreateGamePayload) => gamesService.createGame(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", eventId] });
    },
  });

  const recordScoreMutation = useMutation({
    mutationFn: (dto: IRecordScorePayload) => gamesService.recordScore(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", eventId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard", eventId] });
      queryClient.invalidateQueries({ queryKey: ["teams", eventId] });
    },
  });

  return {
    games: gamesQuery.data || EMPTY_GAMES,
    leaderboard: leaderboardQuery.data || EMPTY_LEADERBOARD,
    isLoadingGames: gamesQuery.isLoading,
    isLoadingLeaderboard: leaderboardQuery.isLoading,
    createGame: createGameMutation.mutateAsync,
    recordScore: recordScoreMutation.mutateAsync,
    isRecordingScore: recordScoreMutation.isPending,
  };
}
