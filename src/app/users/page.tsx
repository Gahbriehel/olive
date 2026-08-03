"use client";

import React from "react";
import { useUsers } from "@/hooks/useUsers";
import { UsersView } from "@/components/views/UsersView";

export default function UsersPage() {
  const { users, isLoading } = useUsers();

  if (isLoading && (!users || users.length === 0)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <UsersView users={users} />;
}
