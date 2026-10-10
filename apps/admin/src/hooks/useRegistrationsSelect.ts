import { useQuery } from "@tanstack/react-query";
import { useDashboard } from "@/context/DashboardContext";
import { IQueryParams } from "@/models/base";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { registrationsService } from "@/services/registrations.service";

/**
 * Query hook for MultiSelect (`queryHook` prop): searches and paginates
 * registrants of the selected event for recipient pickers.
 */
export function useRegistrationsSelectQuery(
  params: IQueryParams & { name?: string },
) {
  const { selectedEventId } = useDashboard();
  const query = useQuery({
    queryKey: ["registrations-select", selectedEventId, params],
    queryFn: async () => {
      const searchTerm = params.name || params.search || undefined;
      const res = await registrationsService.getRegistrations({
        eventId: selectedEventId || undefined,
        page: params.page,
        limit: params.limit || 20,
        search: searchTerm,
      });
      return {
        items: res.registrations.map(adaptApiRegistrationToRegistration),
        totalCount: res.meta?.total ?? res.registrations.length,
      };
    },
    staleTime: 1000 * 60,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
