import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { ChurchSettings } from "@/types/dashboard";
import { useAuth } from "@/hooks/useAuth";

export function useSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: ChurchSettings) =>
      settingsService.updateSettings(newSettings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Derived effective settings considering user's dynamic church name
  const dynamicChurchName = user?.church?.name || user?.churchName;
  const effectiveSettings = settingsQuery.data
    ? {
        ...settingsQuery.data,
        churchName:
          dynamicChurchName && settingsQuery.data.churchName === "Church Events"
            ? dynamicChurchName
            : settingsQuery.data.churchName,
      }
    : undefined;

  return {
    settings: effectiveSettings,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
