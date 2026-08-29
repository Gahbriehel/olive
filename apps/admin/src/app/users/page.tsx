"use client";

import React from "react";
import { useUsers } from "@/hooks/useUsers";
import { UsersView } from "@/components/views/UsersView";
import { ICreateUserPayload, IUpdateUserPayload } from "@/models/dashboard";

export default function UsersPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [page, limit, search],
  );

  const {
    users,
    meta,
    isLoading,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers(queryParams);

  const handleCreateUser = async (payload: ICreateUserPayload) => {
    await createUser(payload);
  };

  const handleUpdateUser = async (id: string, payload: IUpdateUserPayload) => {
    await updateUser({ id, payload });
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
  };

  const handleSearchChange = React.useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <UsersView
      users={users}
      meta={meta}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      search={search}
      onSearchChange={handleSearchChange}
      onRefetch={refetch}
      onCreateUser={handleCreateUser}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      isLoading={isLoading}
    />
  );
}
