import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { givingAccountsService } from "@/services/giving-accounts.service";
import {
  CreateGivingAccountPayload,
  GivingAccount,
  UpdateGivingAccountPayload,
  ReorderGivingAccountsPayload,
} from "@/models/giving-account";

export const GIVING_ACCOUNTS_QUERY_KEY = ["giving-accounts"];

const EMPTY_ACCOUNTS: GivingAccount[] = [];

/**
 * Success toasts come from `meta.successMessage` (see providers.tsx) and API
 * errors are toasted by the API client interceptor, so neither is handled here.
 */
export function useGivingAccounts(enabled = true) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: GIVING_ACCOUNTS_QUERY_KEY });

  const query = useQuery({
    queryKey: GIVING_ACCOUNTS_QUERY_KEY,
    queryFn: () => givingAccountsService.getAll(),
    enabled,
  });

  const createMutation = useMutation({
    meta: { successMessage: "Giving account created" },
    mutationFn: (payload: CreateGivingAccountPayload) =>
      givingAccountsService.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    meta: { successMessage: "Giving account updated" },
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGivingAccountPayload;
    }) => givingAccountsService.update(id, payload),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    meta: { successMessage: "Display order saved" },
    mutationFn: (payload: ReorderGivingAccountsPayload) =>
      givingAccountsService.reorder(payload),
    onSuccess: invalidate,
    // Refetch so the list snaps back to the server order if saving failed.
    onError: invalidate,
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Giving account removed" },
    mutationFn: (id: string) => givingAccountsService.remove(id),
    onSuccess: invalidate,
  });

  return {
    accounts: query.data ?? EMPTY_ACCOUNTS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    reorderAccounts: reorderMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isReordering: reorderMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
