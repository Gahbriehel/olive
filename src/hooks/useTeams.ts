import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ICreateTeamPayload, IApiTeam } from "@/models/team";
import { teamsService } from "@/services/teams.service";

const EMPTY_TEAMS: IApiTeam[] = [];

export function useTeams(eventId?: string) {
  const queryClient = useQueryClient();

  const teamsQuery = useQuery({
    queryKey: ["teams", eventId],
    queryFn: () => teamsService.getTeams(eventId),
    staleTime: 1000 * 60 * 2,
  });

  const createTeamMutation = useMutation({
    mutationFn: (dto: ICreateTeamPayload) => teamsService.createTeam(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", eventId] });
    },
  });

  return {
    teams: teamsQuery.data || EMPTY_TEAMS,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    refetch: teamsQuery.refetch,
    createTeam: createTeamMutation.mutateAsync,
  };
}
