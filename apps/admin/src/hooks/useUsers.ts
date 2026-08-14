import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { ICreateUserPayload, IUpdateUserPayload } from "@/models/dashboard";
import { IQueryParams } from "@/models/base";

export function useUsers(params?: IQueryParams) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 1000 * 60 * 5,
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: ICreateUserPayload) =>
      usersService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateUserPayload;
    }) => usersService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });

  return {
    users: usersQuery.data?.users || [],
    meta: usersQuery.data?.meta,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
    refetch: usersQuery.refetch,
  };
}
