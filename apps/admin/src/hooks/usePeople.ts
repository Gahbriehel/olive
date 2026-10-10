import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IPersonPayload,
  IUpdatePersonPayload,
  IPersonResponse,
} from "@/models/person";
import { IQueryParams } from "@/models/base";
import { peopleService } from "@/services/people.service";

const EMPTY_PEOPLE: IPersonResponse[] = [];

export function usePeople(params?: IQueryParams) {
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: ["people", params],
    queryFn: () => peopleService.getPeople(params),
    staleTime: 1000 * 60 * 2,
  });

  const createPersonMutation = useMutation({
    meta: { successMessage: "Person added" },
    mutationFn: (dto: IPersonPayload) => peopleService.createPerson(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const updatePersonMutation = useMutation({
    meta: { successMessage: "Person updated" },
    mutationFn: ({ id, dto }: { id: string; dto: IUpdatePersonPayload }) =>
      peopleService.updatePerson(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  return {
    people: peopleQuery.data?.people || EMPTY_PEOPLE,
    meta: peopleQuery.data?.meta,
    stats: peopleQuery.data?.stats,
    isLoading: peopleQuery.isLoading,
    isError: peopleQuery.isError,
    error: peopleQuery.error,
    refetch: peopleQuery.refetch,
    createPerson: createPersonMutation.mutateAsync,
    isCreating: createPersonMutation.isPending,
    updatePerson: updatePersonMutation.mutateAsync,
    isUpdating: updatePersonMutation.isPending,
  };
}

/** One person's full record (e.g. for the edit form); seeded with what the list already has. */
export function usePerson(id?: string, initialData?: IPersonResponse) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: () => peopleService.getPersonById(id as string),
    initialData,
    staleTime: 1000 * 60,
    enabled: Boolean(id),
  });
}
