import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { IDashboardData } from "@/models/dashboard";

export function useDashboardData() {
  const dashboardQuery = useQuery<IDashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });

  return {
    dashboardData: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
