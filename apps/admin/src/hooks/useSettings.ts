import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { authService } from "@/services/auth.service";
import { IChurchSettings, IUpdateProfilePayload } from "@/models/dashboard";
import { IChangePasswordPayload } from "@/models/auth";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";

export function useSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 1000 * 60 * 15,
    enabled: isAdmin,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<IChurchSettings>) =>
      settingsService.updateSettings(newSettings),
    onSuccess: (data) => {
      queryClient.setQueryData(["settings"], data);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => settingsService.getProfile(),
    staleTime: 1000 * 60 * 15,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: IUpdateProfilePayload) =>
      settingsService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: IChangePasswordPayload) =>
      authService.changePassword(payload),
  });

  const dynamicChurchName = user?.church?.name || user?.churchName;
  const effectiveSettings = useMemo(() => {
    return settingsQuery.data
      ? {
          ...settingsQuery.data,
          churchName:
            dynamicChurchName &&
            settingsQuery.data.churchName === "Church Events"
              ? dynamicChurchName
              : settingsQuery.data.churchName,
        }
      : undefined;
  }, [settingsQuery.data, dynamicChurchName]);

  return {
    settings: effectiveSettings,
    isLoadingSettings: settingsQuery.isLoading,
    isErrorSettings: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,

    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    isErrorProfile: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    // Backward compatibility aliases
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    isUpdating: updateSettingsMutation.isPending,
    refetch: settingsQuery.refetch,
  };
}
