import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IPersonPayload,
  IUpdatePersonPayload,
  IPromotePersonPayload,
  IPersonResponse,
  IAddRelativePayload,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", variables.id] });
    },
  });

  const promotePersonMutation = useMutation({
    meta: { successMessage: "Person promoted successfully" },
    mutationFn: ({
      id,
      membershipStatus,
    }: {
      id: string;
      membershipStatus: IPromotePersonPayload["membershipStatus"];
    }) => peopleService.promotePerson(id, { membershipStatus }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", variables.id] });
    },
  });

  const deletePersonMutation = useMutation({
    meta: { successMessage: "Person deleted successfully" },
    mutationFn: (id: string) => peopleService.deletePerson(id),
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
    promotePerson: promotePersonMutation.mutateAsync,
    isPromoting: promotePersonMutation.isPending,
    deletePerson: deletePersonMutation.mutateAsync,
    isDeleting: deletePersonMutation.isPending,
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

/** Family links for one person (GET /people/:id/relatives). */
export function useRelatives(id?: string) {
  return useQuery({
    queryKey: ["person-relatives", id],
    queryFn: () => peopleService.getRelatives(id as string),
    enabled: Boolean(id),
  });
}

export function useAddRelative(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Family link added" },
    mutationFn: (dto: IAddRelativePayload) =>
      peopleService.addRelative(personId, dto),
    onSuccess: (_, dto) => {
      queryClient.invalidateQueries({
        queryKey: ["person-relatives", personId],
      });
      queryClient.invalidateQueries({
        queryKey: ["person-relatives", dto.relatedPersonId],
      });
    },
  });
}

export function useRemoveRelative(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Family link removed" },
    mutationFn: (relationshipId: string) =>
      peopleService.removeRelative(personId, relationshipId),
    onSuccess: () => {
      // The other person's list holds the inverse row, so refresh all of them.
      queryClient.invalidateQueries({ queryKey: ["person-relatives"] });
    },
  });
}
