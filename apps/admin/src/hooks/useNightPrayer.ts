import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { nightPrayerService } from "@/services/night-prayer.service";
import {
  CreateNightPrayerExceptionPayload,
  NightPrayerException,
  NightPrayerPayload,
} from "@/models/night-prayer";

export const NIGHT_PRAYER_KEY = ["night-prayer"];
export const NIGHT_PRAYER_EXCEPTIONS_KEY = ["night-prayer", "exceptions"];

const EMPTY: NightPrayerException[] = [];

export function useNightPrayer() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NIGHT_PRAYER_KEY,
    queryFn: () => nightPrayerService.get(),
  });

  const saveMutation = useMutation({
    meta: { successMessage: "Night prayer settings saved" },
    mutationFn: (payload: NightPrayerPayload) =>
      nightPrayerService.save(payload),
    onSuccess: (saved) => queryClient.setQueryData(NIGHT_PRAYER_KEY, saved),
  });

  return {
    config: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}

export function useNightPrayerExceptions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: NIGHT_PRAYER_EXCEPTIONS_KEY });

  const query = useQuery({
    queryKey: NIGHT_PRAYER_EXCEPTIONS_KEY,
    queryFn: () => nightPrayerService.getExceptions(),
  });

  const createMutation = useMutation({
    meta: { successMessage: "Date exception saved" },
    mutationFn: (payload: CreateNightPrayerExceptionPayload) =>
      nightPrayerService.createException(payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Date exception removed" },
    mutationFn: (id: string) => nightPrayerService.removeException(id),
    onSuccess: invalidate,
  });

  return {
    exceptions: query.data ?? EMPTY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createException: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteException: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
