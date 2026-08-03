import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ICreateEventPayload,
  IUpdateEventPayload,
  IApiEvent,
} from "@/models/event";
import { IQueryParams } from "@/models/base";
import { eventsService } from "@/services/events.service";

const EMPTY_EVENTS: IApiEvent[] = [];

export function useEvents(params?: IQueryParams) {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["events", params],
    queryFn: () => eventsService.getEvents(params),
    staleTime: 1000 * 60 * 2,
  });

  const createEventMutation = useMutation({
    mutationFn: (dto: ICreateEventPayload) => eventsService.createEvent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateEventPayload }) =>
      eventsService.updateEvent(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events: eventsQuery.data?.events || EMPTY_EVENTS,
    meta: eventsQuery.data?.meta,
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
  };
}
