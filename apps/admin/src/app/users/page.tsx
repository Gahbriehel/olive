"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  X,
  UserPlus,
  Shield,
  Users as UsersIcon,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { UserForm, UserFormValues } from "@/components/Forms/UserForm";
import { ROLES, getUserRoles, hasAuthority } from "@/utils/rbac";
import { IS_STRICT_RBAC_RESTRICTED } from "@/config/features";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useListFilters } from "@/hooks/useListFilters";
import {
  IAdminUser,
  ICreateUserPayload,
  IUpdateUserPayload,
} from "@/models/dashboard";

interface PermissionMatrixItem {
  item: string;
  route: string;
  superAdmin: boolean;
  churchAdmin: boolean;
  coordinator: boolean;
  regDesk: boolean;
}

const permissionsMatrix: PermissionMatrixItem[] = [
  {
    item: "📊 Dashboard",
    route: "/dashboard",
    superAdmin: true,
    churchAdmin: true,
    coordinator: false,
    regDesk: false,
  },
  {
    item: "🗓️ Events",
    route: "/events",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: false,
  },
  {
    item: "🛡️ Teams",
    route: "/teams",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: false,
  },
  {
    item: "🎮 Games",
    route: "/games",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: false,
  },
  {
    item: "🏆 Scores & Leaderboard",
    route: "/scores",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: false,
  },
  {
    item: "📋 Registrations",
    route: "/registrations",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: true,
  },
  {
    item: "📱 Attendance Check-In",
    route: "/attendance",
    superAdmin: true,
    churchAdmin: true,
    coordinator: true,
    regDesk: true,
  },
  {
    item: "👥 Users & Roles",
    route: "/users",
    superAdmin: true,
    churchAdmin: true,
    coordinator: false,
    regDesk: false,
  },
  {
    item: "⚙️ Church Settings",
    route: "/settings",
    superAdmin: true,
    churchAdmin: true,
    coordinator: false,
    regDesk: false,
  },
];

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

  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
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

  const userColumns = useMemo<ColumnDef<IAdminUser>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) =>
          padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      },
      {
        accessorKey: "name",
        header: "Administrator / User",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(u.name)}
              </div>
              <div>
                <p className="font-bold text-fg">{capitalizeWords(u.name)}</p>
                <TruncatedTextWithCopy
                  text={u.email}
                  maxLength={28}
                  textClassName="text-2xs text-fg-muted"
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Assigned Role",
        cell: ({ row }) => (
          <Badge variant="indigo" className="uppercase text-2xs font-bold">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Account Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "lastActive",
        header: "Last Activity",
        cell: ({ row }) => (
          <span className="text-fg-muted text-xs">
            {row.original.lastActive}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex justify-end">
              <ActionsList
                actions={[
                  {
                    title: "Edit User",
                    fn: () => setEditingUser(u),
                  },
                  {
                    title: "Delete User",
                    fn: () => setDeletingUser(u),
                    destructive: true,
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [page, limit],
  );

  const permissionColumns = useMemo<ColumnDef<PermissionMatrixItem>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) => padNumberWithZeros(rowIndex + 1),
      },
      {
        accessorKey: "item",
        header: "Sidebar Navigation & Route",
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-fg">{row.original.item}</p>
            <p className="text-2xs font-mono text-fg-muted">
              {row.original.route}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "superAdmin",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-fg">Super Admin</p>
            <span className="text-2xs font-mono text-primary-text">
              SUPER_ADMIN
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.superAdmin ? (
              <Check className="w-4 h-4 text-success-text mx-auto" />
            ) : (
              <X className="w-4 h-4 text-fg-subtle mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "churchAdmin",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-fg">Church Admin</p>
            <span className="text-2xs font-mono text-primary-text">ADMIN</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.churchAdmin ? (
              <Check className="w-4 h-4 text-success-text mx-auto" />
            ) : (
              <X className="w-4 h-4 text-fg-subtle mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "coordinator",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-fg">Event Coordinator</p>
            <span className="text-2xs font-mono text-primary-text">
              COORDINATOR
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.coordinator ? (
              <Check className="w-4 h-4 text-success-text mx-auto" />
            ) : (
              <X className="w-4 h-4 text-fg-subtle mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "regDesk",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-fg">Registration Desk</p>
            <span className="text-2xs font-mono text-primary-text">
              REGISTRATION_DESK
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.regDesk ? (
              <Check className="w-4 h-4 text-success-text mx-auto" />
            ) : (
              <X className="w-4 h-4 text-fg-subtle mx-auto" />
            )}
          </div>
        ),
      },
    ],
    [],
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

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="User management views"
            className="flex items-center gap-2 border-b border-border text-xs"
          >
            <button
              type="button"
              role="tab"
              id="users-tab-users"
              aria-selected={activeTab === "users"}
              aria-controls="users-tabpanel"
              onClick={() => setActiveTab("users")}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-primary text-primary-text"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              Administrator & User Directory ({users.length})
            </button>
            <button
              type="button"
              role="tab"
              id="users-tab-permissions"
              aria-selected={activeTab === "permissions"}
              aria-controls="users-tabpanel"
              onClick={() => setActiveTab("permissions")}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
                activeTab === "permissions"
                  ? "border-primary text-primary-text"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              RBAC Role Permission Matrix
            </button>
          </div>

          <div
            role="tabpanel"
            id="users-tabpanel"
            aria-labelledby={
              activeTab === "users"
                ? "users-tab-users"
                : "users-tab-permissions"
            }
          >
            {activeTab === "users" ? (
              <Table
                columns={userColumns}
                data={users}
                searchPlaceholder="Search users by name, email, or role..."
                enableSearch={true}
                enablePagination={true}
                defaultPageSize={10}
                emptyMessage="No users found"
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
                onRetry={() => refetch()}
                resource="users"
              >
                <ListToolbar
                  create={{
                    label: "Invite User",
                    onClick: () => setIsCreateOpen(true),
                    icon: <UserPlus className="w-4 h-4" />,
                    show: canManageUsers,
                  }}
                  actions={[
                    { title: "Refresh", fn: () => refetch() },
                    ...(canManageUsers
                      ? [
                          {
                            title: "Export CSV",
                            fn: () =>
                              downloadCsvExport(
                                "/users/export",
                                exportParams,
                                `users-${new Date().toISOString().slice(0, 10)}.csv`,
                              ),
                          },
                        ]
                      : []),
                  ]}
                />
              </Table>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Role Access Control Matrix</CardTitle>
                    <CardDescription>
                      System permission rules governing module access per role
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Table
                  columns={permissionColumns}
                  data={permissionsMatrix}
                  enableSearch={false}
                  enablePagination={false}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        /* Team Access & Onboarding Notice Card for Non-Super Admins */
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-subtle border border-border space-y-4 shadow-sm my-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary-text flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-fg">
              Team Access & Onboarding
            </h3>
            <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
              Ready to add someone new to the team? You can invite new team
              members anytime with the button below. To review the full
              directory or request role updates for existing users, please
              contact a Super Administrator.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Invite New User
            </Button>
          </div>
        </div>
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
