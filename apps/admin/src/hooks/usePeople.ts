import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreatePersonPayload,
  IUpdatePersonPayload,
  IApiPerson,
} from "@/models/person";
import { IQueryParams } from "@/models/base";
import { peopleService } from "@/services/people.service";

const EMPTY_PEOPLE: IApiPerson[] = [];

export function usePeople(params?: IQueryParams) {
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: ["people", params],
    queryFn: () => peopleService.getPeople(params),
    staleTime: 1000 * 60 * 2,
  });

  const createPersonMutation = useMutation({
    mutationFn: (dto: ICreatePersonPayload) => peopleService.createPerson(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdatePersonPayload }) =>
      peopleService.updatePerson(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  return {
    people: peopleQuery.data?.people || EMPTY_PEOPLE,
    meta: peopleQuery.data?.meta,
    isLoading: peopleQuery.isLoading,
    isError: peopleQuery.isError,
    refetch: peopleQuery.refetch,
    createPerson: createPersonMutation.mutateAsync,
    isCreating: createPersonMutation.isPending,
    updatePerson: updatePersonMutation.mutateAsync,
  };
}
