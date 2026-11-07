import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scripturesService } from "@/services/scriptures.service";
import {
  CreateScripturePayload,
  Scripture,
  ScriptureKind,
  UpdateScripturePayload,
} from "@/models/scripture";

export const SCRIPTURES_QUERY_KEY = ["scriptures"];
export const scripturesKindKey = (kind: ScriptureKind) => ["scriptures", kind];

const EMPTY_LIST: Scripture[] = [];

/**
 * Success toasts come from `meta.successMessage` (see providers.tsx) and API
 * errors are toasted by the API client interceptor, so neither is handled here.
 * Mutations invalidate both kinds: publishing one record changes `isCurrent`
 * on its siblings.
 */
export function useScriptures(kind: ScriptureKind) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: SCRIPTURES_QUERY_KEY });

  const query = useQuery({
    queryKey: scripturesKindKey(kind),
    queryFn: () => scripturesService.getByKind(kind),
  });

  const createMutation = useMutation({
    meta: { successMessage: "Scripture saved" },
    mutationFn: (payload: CreateScripturePayload) =>
      scripturesService.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    meta: { successMessage: "Scripture updated" },
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateScripturePayload;
    }) => scripturesService.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Scripture deleted" },
    mutationFn: (id: string) => scripturesService.remove(id),
    onSuccess: invalidate,
  });

  return {
    scriptures: query.data ?? EMPTY_LIST,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createScripture: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateScripture: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteScripture: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
