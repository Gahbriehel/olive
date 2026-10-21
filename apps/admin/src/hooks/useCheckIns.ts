import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
  IPastoralCheckIn,
} from "@/models/checkIn";
import { checkInService } from "@/services/checkIn.service";

const EMPTY_CHECK_INS: IPastoralCheckIn[] = [];

export function useCheckIns(params?: ICheckInQueryParams) {
  const queryClient = useQueryClient();

  const checkInsQuery = useQuery({
    queryKey: ["check-ins", params],
    queryFn: () => checkInService.getCheckIns(params),
    staleTime: 1000 * 60 * 2,
  });

  const invalidateRelated = () => {
    queryClient.invalidateQueries({ queryKey: ["check-ins"] });
    queryClient.invalidateQueries({ queryKey: ["people"] });
    queryClient.invalidateQueries({ queryKey: ["person"] });
  };

  const createCheckInMutation = useMutation({
    meta: { successMessage: "Pastoral check-in recorded" },
    mutationFn: (payload: ICreateCheckInPayload) =>
      checkInService.createCheckIn(payload),
    onSuccess: () => {
      invalidateRelated();
    },
  });

  const updateCheckInMutation = useMutation({
    meta: { successMessage: "Check-in updated" },
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateCheckInPayload;
    }) => checkInService.updateCheckIn(id, payload),
    onSuccess: () => {
      invalidateRelated();
    },
  });

  const completeCheckInMutation = useMutation({
    meta: { successMessage: "Check-in marked as completed" },
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) =>
      checkInService.completeCheckIn(id, outcome),
    onSuccess: () => {
      invalidateRelated();
    },
  });

  const cancelCheckInMutation = useMutation({
    meta: { successMessage: "Check-in task cancelled" },
    mutationFn: (id: string) => checkInService.cancelCheckIn(id),
    onSuccess: () => {
      invalidateRelated();
    },
  });

  return {
    checkIns: checkInsQuery.data?.checkIns || EMPTY_CHECK_INS,
    meta: checkInsQuery.data?.meta,
    isLoading: checkInsQuery.isLoading,
    isError: checkInsQuery.isError,
    error: checkInsQuery.error,
    refetch: checkInsQuery.refetch,
    createCheckIn: createCheckInMutation.mutateAsync,
    isCreating: createCheckInMutation.isPending,
    updateCheckIn: updateCheckInMutation.mutateAsync,
    isUpdating: updateCheckInMutation.isPending,
    completeCheckIn: completeCheckInMutation.mutateAsync,
    isCompleting: completeCheckInMutation.isPending,
    cancelCheckIn: cancelCheckInMutation.mutateAsync,
    isCancelling: cancelCheckInMutation.isPending,
  };
}
