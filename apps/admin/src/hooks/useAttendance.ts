import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICheckInPayload } from "@/models/registration";
import { attendanceService } from "@/services/attendance.service";

export function useAttendance() {
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: (dto: ICheckInPayload) =>
      attendanceService.checkInAttendee(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    checkIn: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    error: checkInMutation.error,
  };
}
