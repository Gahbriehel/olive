import { useQuery } from "@tanstack/react-query";
import { IQueryParams } from "@/models/base";
import { adaptApiPersonToPerson } from "@/models/person";
import { peopleService } from "@/services/people.service";

/**
 * Query hook for MultiSelect (`queryHook` prop): searches and paginates
 * people for recipient pickers.
 */
export function usePeopleSelectQuery(params: IQueryParams & { name?: string }) {
  const query = useQuery({
    queryKey: ["people-select", params],
    queryFn: async () => {
      const searchTerm = params.name || params.search || undefined;
      const res = await peopleService.getPeople({
        page: params.page,
        limit: params.limit || 20,
        search: searchTerm,
      });
      return {
        items: res.people.map(adaptApiPersonToPerson),
        totalCount: res.meta?.total ?? res.people.length,
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
