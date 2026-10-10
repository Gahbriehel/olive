"use client";

import React, { useState, useMemo } from "react";
import { Shield, Users as UsersIcon, ShieldCheck, Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { UserForm, UserFormValues } from "@/components/Forms/UserForm";
import { ROLES, getUserRoles, hasAuthority } from "@/utils/rbac";
import { IS_STRICT_RBAC_RESTRICTED } from "@/config/features";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useListFilters } from "@/hooks/useListFilters";
import {
  IAdminUser,
  ICreateUserPayload,
  IUpdateUserPayload,
} from "@/models/dashboard";
import { getUserColumns } from "./_components/userColumns";
import { PermissionsMatrixPanel } from "./_components/PermissionsMatrixPanel";
import { OnboardingNotice } from "./_components/OnboardingNotice";
import { UsersDirectoryPanel } from "./_components/UsersDirectoryPanel";
import { UsersTabs, type UsersTab } from "./_components/UsersTabs";

export default function UsersPage() {
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    queryParams,
    exportParams,
  } = useListFilters({});

  const {
    users,
    meta,
    isLoading,
    isError,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers(queryParams);

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN]);
  const canAccessUserDirectory = IS_STRICT_RBAC_RESTRICTED
    ? isSuperAdmin
    : true;
  const canManageUsers = hasAuthority(userRoles, [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const [activeTab, setActiveTab] = useState<UsersTab>("users");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IAdminUser | null>(null);

  const handleCreateSubmit = async (data: UserFormValues) => {
    const payload: ICreateUserPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      role: data.role,
      password: data.password || undefined,
    };

    try {
      await createUser(payload);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleEditSubmit = async (data: UserFormValues) => {
    if (!editingUser) return;

    const payload: IUpdateUserPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      role: data.role,
      isActive: data.status === "Active",
    };

    try {
      await updateUser({ id: editingUser.id, payload });
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  // Errors propagate so ConfirmActionModal shows them inline.
  const handleDeletePerform = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  const totalUsers = meta?.total ?? users.length;
  // No aggregate endpoint yet: these breakdowns only cover the loaded page.
  const statsArePartial = totalUsers > users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const superAdmins = users.filter(
    (u) =>
      u.role === "SUPER_ADMIN" ||
      u.role === "ADMIN" ||
      u.role === "Super Admin" ||
      u.role === "Church Admin",
  ).length;
  const deskStaff = users.filter(
    (u) =>
      u.role === "COORDINATOR" ||
      u.role === "REGISTRATION_DESK" ||
      u.role === "WORKER" ||
      u.role === "LEADER" ||
      u.role === "Event Coordinator" ||
      u.role === "Registration Desk",
  ).length;

  const userColumns = useMemo(
    () =>
      getUserColumns({
        page,
        limit,
        onEdit: setEditingUser,
        onDelete: setDeletingUser,
      }),
    [page, limit],
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Users & Permission Control"
        description="Manage system access, assign roles, and synchronize user contact directory."
      />

      {canAccessUserDirectory ? (
        <>
          {/* Metrics Cards */}
          <StatsCardGroup>
            <StatsCard
              title="Total System Users"
              value={totalUsers.toLocaleString()}
              change="Admin accounts"
              trend="neutral"
              icon={UsersIcon}
              color="indigo"
              loading={isLoading}
            />
            <StatsCard
              title="Active Accounts"
              value={activeUsers.toLocaleString()}
              change="Logged in recently"
              trend="up"
              icon={ShieldCheck}
              color="emerald"
              description={statsArePartial ? "Current page only" : undefined}
              loading={isLoading}
            />
            <StatsCard
              title="System Administrators"
              value={superAdmins.toLocaleString()}
              change="ADMINS"
              trend="neutral"
              icon={Shield}
              color="cyan"
              description={statsArePartial ? "Current page only" : undefined}
              loading={isLoading}
            />
            <StatsCard
              title="Coordinators & Desk Staff"
              value={deskStaff.toLocaleString()}
              change="COORDINATORS"
              trend="neutral"
              icon={Lock}
              color="amber"
              description={statsArePartial ? "Current page only" : undefined}
              loading={isLoading}
            />
          </StatsCardGroup>

          <UsersTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            userCount={users.length}
          >
            {activeTab === "users" ? (
              <UsersDirectoryPanel
                columns={userColumns}
                data={users}
                meta={meta}
                page={page}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                search={search}
                onSearchChange={setSearch}
                loading={isLoading}
                isError={isError}
                error={error}
                onRefresh={() => refetch()}
                onInvite={() => setIsCreateOpen(true)}
                canManageUsers={canManageUsers}
                exportParams={exportParams}
              />
            ) : (
              <PermissionsMatrixPanel />
            )}
          </UsersTabs>
        </>
      ) : (
        <OnboardingNotice onInvite={() => setIsCreateOpen(true)} />
      )}

      {/* Create User Sidebar Modal */}
      <SidebarModal
        title="Invite & Create System User"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <UserForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreating}
        />
      </SidebarModal>

      {/* Edit User Sidebar Modal */}
      <SidebarModal
        title="Edit User & System Role"
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      >
        {editingUser && (
          <UserForm
            initialValues={editingUser}
            onSubmit={handleEditSubmit}
            // DeleteButton in the form already confirms; delete directly.
            onDelete={async () => {
              await deleteUser(editingUser.id);
              setEditingUser(null);
            }}
            onCancel={() => setEditingUser(null)}
            isLoading={isUpdating}
            isDeleting={isDeleting}
          />
        )}
      </SidebarModal>

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <ConfirmActionModal
          display={Boolean(deletingUser)}
          close={() => setDeletingUser(null)}
          actionName="delete"
          title={`Are you sure you want to delete user account "${deletingUser.name}"?`}
          fn={handleDeletePerform}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
