import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IRegisterPayload, IApiRegistration } from "@/models/registration";
import { IQueryParams } from "@/models/base";
import { registrationsService } from "@/services/registrations.service";

const EMPTY_REGISTRATIONS: IApiRegistration[] = [];

export function useRegistrations(params?: IQueryParams) {
  const queryClient = useQueryClient();

  const registrationsQuery = useQuery({
    queryKey: ["registrations", params],
    queryFn: () => registrationsService.getRegistrations(params),
    staleTime: 1000 * 30,
  });

  const registerMutation = useMutation({
    mutationFn: ({
      eventId,
      dto,
    }: {
      eventId: string;
      dto: IRegisterPayload;
    }) => registrationsService.registerAttendee(eventId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    registrations: registrationsQuery.data || EMPTY_REGISTRATIONS,
    isLoading: registrationsQuery.isLoading,
    isError: registrationsQuery.isError,
    refetch: registrationsQuery.refetch,
    registerAttendee: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
}
