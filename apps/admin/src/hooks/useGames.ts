import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateGamePayload,
  IRecordScorePayload,
  IApiGame,
  ILeaderboardEntry,
  IUpdateGamePayload,
} from "@/models/game";
import { IQueryParams } from "@/models/base";
import { gamesService } from "@/services/games.service";

const EMPTY_GAMES: IApiGame[] = [];
const EMPTY_LEADERBOARD: ILeaderboardEntry[] = [];

export function useGames(params?: IQueryParams | string) {
  const queryClient = useQueryClient();
  const normalizedParams: IQueryParams =
    typeof params === "string" ? { eventId: params } : params || {};
  const eventId = normalizedParams.eventId;

  const gamesQuery = useQuery({
    queryKey: ["games", normalizedParams],
    queryFn: () => gamesService.getGames(normalizedParams),
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
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateGamePayload;
    }) => gamesService.updateGame(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: (id: string) => gamesService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const recordScoreMutation = useMutation({
    mutationFn: (dto: IRecordScorePayload) => gamesService.recordScore(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["teams", eventId] });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<IRecordScorePayload>;
    }) => gamesService.updateScore(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const clearGameScoresMutation = useMutation({
    mutationFn: (gameId: string) => gamesService.clearGameScores(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  return {
    games: gamesQuery.data?.games || EMPTY_GAMES,
    meta: gamesQuery.data?.meta,
    leaderboard: leaderboardQuery.data || EMPTY_LEADERBOARD,
    isLoadingGames: gamesQuery.isLoading,
    isLoadingLeaderboard: leaderboardQuery.isLoading,
    createGame: createGameMutation.mutateAsync,
    isCreatingGame: createGameMutation.isPending,
    updateGame: updateGameMutation.mutateAsync,
    isUpdatingGame: updateGameMutation.isPending,
    deleteGame: deleteGameMutation.mutateAsync,
    isDeletingGame: deleteGameMutation.isPending,
    recordScore: recordScoreMutation.mutateAsync,
    isRecordingScore: recordScoreMutation.isPending,
    updateScore: updateScoreMutation.mutateAsync,
    isUpdatingScore: updateScoreMutation.isPending,
    clearGameScores: clearGameScoresMutation.mutateAsync,
    isClearingScores: clearGameScoresMutation.isPending,
    refetch: async () => {
      await Promise.all([gamesQuery.refetch(), leaderboardQuery.refetch()]);
    },
  };
}
