import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ITeamPayload, IUpdateTeamPayload, ITeamResponse } from "@/models/team";
import { IQueryParams } from "@/models/base";
import { teamsService } from "@/services/teams.service";

const EMPTY_TEAMS: ITeamResponse[] = [];

export function useTeams(params?: IQueryParams | string) {
  const queryClient = useQueryClient();
  const normalizedParams: IQueryParams =
    typeof params === "string" ? { eventId: params } : params || {};

  const teamsQuery = useQuery({
    queryKey: ["teams", normalizedParams],
    queryFn: () => teamsService.getTeams(normalizedParams),
    staleTime: 1000 * 60,
  });

  const createTeamMutation = useMutation({
    mutationFn: (dto: ITeamPayload) => teamsService.createTeam(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateTeamPayload;
    }) => teamsService.updateTeam(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => teamsService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  return {
    teams: teamsQuery.data?.teams || EMPTY_TEAMS,
    meta: teamsQuery.data?.meta,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    refetch: teamsQuery.refetch,
    createTeam: createTeamMutation.mutateAsync,
    isCreatingTeam: createTeamMutation.isPending,
    updateTeam: updateTeamMutation.mutateAsync,
    isUpdatingTeam: updateTeamMutation.isPending,
    deleteTeam: deleteTeamMutation.mutateAsync,
    isDeletingTeam: deleteTeamMutation.isPending,
  };
}
