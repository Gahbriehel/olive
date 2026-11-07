import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";
import {
  Encouragement,
  EncouragementPayload,
  NotificationSettings,
} from "@/models/notifications";

export const PUSH_OVERVIEW_KEY = ["push", "log"];
export const ENCOURAGEMENTS_KEY = ["encouragements"];
export const NOTIFICATION_SETTINGS_KEY = ["notification-settings"];

const EMPTY: Encouragement[] = [];

export function usePushOverview() {
  const query = useQuery({
    queryKey: PUSH_OVERVIEW_KEY,
    queryFn: () => notificationsService.getPushOverview(),
  });
  return {
    overview: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export function useEncouragements(page: number, limit: number) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ENCOURAGEMENTS_KEY });

  const query = useQuery({
    queryKey: [...ENCOURAGEMENTS_KEY, page, limit],
    queryFn: () => notificationsService.getEncouragements(page, limit),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    meta: { successMessage: "Message added" },
    mutationFn: (payload: EncouragementPayload) =>
      notificationsService.createEncouragement(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    meta: { successMessage: "Message updated" },
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<EncouragementPayload>;
    }) => notificationsService.updateEncouragement(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Message deleted" },
    mutationFn: (id: string) => notificationsService.removeEncouragement(id),
    onSuccess: invalidate,
  });

  return {
    encouragements: query.data?.items ?? EMPTY,
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createEncouragement: createMutation.mutateAsync,
    updateEncouragement: updateMutation.mutateAsync,
    deleteEncouragement: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useNotificationSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: () => notificationsService.getSettings(),
  });

  const saveMutation = useMutation({
    meta: { successMessage: "Notification settings saved" },
    mutationFn: (payload: NotificationSettings) =>
      notificationsService.saveSettings(payload),
    onSuccess: (saved) =>
      queryClient.setQueryData(NOTIFICATION_SETTINGS_KEY, saved),
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
