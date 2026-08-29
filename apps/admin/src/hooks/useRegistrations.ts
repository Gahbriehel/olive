import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IRegistrationPayload,
  IRegistrationResponse,
} from "@/models/registration";
import { IQueryParams } from "@/models/base";
import { registrationsService } from "@/services/registrations.service";

const EMPTY_REGISTRATIONS: IRegistrationResponse[] = [];

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
      dto: IRegistrationPayload;
    }) => registrationsService.registerAttendee(eventId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  return {
    registrations:
      registrationsQuery.data?.registrations || EMPTY_REGISTRATIONS,
    meta: registrationsQuery.data?.meta,
    isLoading: registrationsQuery.isLoading,
    isError: registrationsQuery.isError,
    refetch: registrationsQuery.refetch,
    registerAttendee: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  };
}
