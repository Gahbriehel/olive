import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confessionsService } from "@/services/confessions.service";
import {
  ConfessionDetail,
  ConfessionListItem,
  ConfessionVoice,
  CreateConfessionPayload,
  ReorderConfessionsPayload,
  UpdateConfessionPayload,
} from "@/models/confession";

export const CONFESSIONS_QUERY_KEY = ["confessions"];
export const CONFESSION_CATEGORIES_KEY = ["confessions", "categories"];
export const confessionDetailKey = (id: string) => [
  "confessions",
  "detail",
  id,
];

const EMPTY_LIST: ConfessionListItem[] = [];
const EMPTY_CATEGORIES: string[] = [];

/**
 * Success toasts come from `meta.successMessage` (see providers.tsx) and API
 * errors are toasted by the API client interceptor, so neither is handled here.
 */
export function useConfessions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });

  const query = useQuery({
    queryKey: CONFESSIONS_QUERY_KEY,
    queryFn: () => confessionsService.getAll(),
  });

  const categoriesQuery = useQuery({
    queryKey: CONFESSION_CATEGORIES_KEY,
    queryFn: () => confessionsService.getCategories(),
  });

  const reorderMutation = useMutation({
    meta: { successMessage: "Display order saved" },
    mutationFn: (payload: ReorderConfessionsPayload) =>
      confessionsService.reorder(payload),
    onSuccess: invalidate,
    // Refetch so the list snaps back to the server order if saving failed.
    onError: invalidate,
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Confession deleted" },
    mutationFn: (id: string) => confessionsService.remove(id),
    onSuccess: invalidate,
  });

  return {
    confessions: query.data ?? EMPTY_LIST,
    categories: categoriesQuery.data ?? EMPTY_CATEGORIES,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    reorderConfessions: reorderMutation.mutateAsync,
    isReordering: reorderMutation.isPending,
    deleteConfession: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

/** Categories only, for the editor's combobox (shares the list's cache entry). */
export function useConfessionCategories() {
  const query = useQuery({
    queryKey: CONFESSION_CATEGORIES_KEY,
    queryFn: () => confessionsService.getCategories(),
  });
  return query.data ?? EMPTY_CATEGORIES;
}

/** Create flow: lives apart from the detail hook because there is no id yet. */
export function useCreateConfession() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    meta: { successMessage: "Confession created" },
    mutationFn: (payload: CreateConfessionPayload) =>
      confessionsService.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(confessionDetailKey(created.id), created);
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
    },
  });
  return {
    createConfession: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}

export function useConfessionDetail(id: string) {
  const queryClient = useQueryClient();
  const enabled = Boolean(id) && id !== "new";

  const query = useQuery({
    queryKey: confessionDetailKey(id),
    queryFn: () => confessionsService.getById(id),
    enabled,
  });

  const store = (updated: ConfessionDetail) => {
    queryClient.setQueryData(confessionDetailKey(id), updated);
    queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
  };

  const updateMutation = useMutation({
    meta: { successMessage: "Confession saved" },
    mutationFn: (payload: UpdateConfessionPayload) =>
      confessionsService.update(id, payload),
    onSuccess: store,
  });

  const uploadMutation = useMutation({
    meta: { successMessage: "Audio uploaded" },
    mutationFn: ({ voice, file }: { voice: ConfessionVoice; file: File }) =>
      confessionsService.uploadAudio(id, voice, file),
    onSuccess: store,
  });

  const deleteAudioMutation = useMutation({
    meta: { successMessage: "Audio removed" },
    mutationFn: (voice: ConfessionVoice) =>
      confessionsService.deleteAudio(id, voice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confessionDetailKey(id) });
      queryClient.invalidateQueries({ queryKey: CONFESSIONS_QUERY_KEY });
    },
  });

  return {
    confession: query.data,
    isLoading: enabled && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateConfession: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    uploadAudio: uploadMutation.mutateAsync,
    uploadingVoice: uploadMutation.isPending
      ? uploadMutation.variables?.voice
      : undefined,
    deleteAudio: deleteAudioMutation.mutateAsync,
    deletingVoice: deleteAudioMutation.isPending
      ? deleteAudioMutation.variables
      : undefined,
  };
}
