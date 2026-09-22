"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { UserForm, UserFormValues } from "@/components/Forms/UserForm";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES, getUserRoles, hasAuthority } from "@/utils/rbac";
import { IS_STRICT_RBAC_RESTRICTED } from "@/config/features";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = useMemo(
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

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN]);
  const canAccessUserDirectory = IS_STRICT_RBAC_RESTRICTED
    ? isSuperAdmin
    : true;

  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<IAdminUser | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
      showNotification("New user account created successfully!");
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
      showNotification("User account & roles updated successfully!");
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeletePerform = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      if (editingUser?.id === deletingUser.id) {
        setEditingUser(null);
      }
      showNotification("User account deleted successfully.");
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleSearchChange = useCallback((newSearch: string) => {
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

  const totalUsers = meta?.total ?? users.length;
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
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(u.name)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {capitalizeWords(u.name)}
                </p>
                <TruncatedTextWithCopy
                  text={u.email}
                  maxLength={28}
                  textClassName="text-[11px] text-slate-400"
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
          <Badge variant="indigo" className="uppercase text-[10px] font-bold">
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
          <span className="text-slate-500 text-xs">
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
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {row.original.item}
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              {row.original.route}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "superAdmin",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Super Admin
            </p>
            <span className="text-[10px] font-mono text-indigo-500">
              SUPER_ADMIN
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.superAdmin ? (
              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
            ) : (
              <X className="w-4 h-4 text-slate-300 dark:text-zinc-700 mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "churchAdmin",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Church Admin
            </p>
            <span className="text-[10px] font-mono text-indigo-500">ADMIN</span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.churchAdmin ? (
              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
            ) : (
              <X className="w-4 h-4 text-slate-300 dark:text-zinc-700 mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "coordinator",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Event Coordinator
            </p>
            <span className="text-[10px] font-mono text-indigo-500">
              COORDINATOR
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.coordinator ? (
              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
            ) : (
              <X className="w-4 h-4 text-slate-300 dark:text-zinc-700 mx-auto" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "regDesk",
        header: () => (
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Registration Desk
            </p>
            <span className="text-[10px] font-mono text-indigo-500">
              REGISTRATION_DESK
            </span>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.regDesk ? (
              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
            ) : (
              <X className="w-4 h-4 text-slate-300 dark:text-zinc-700 mx-auto" />
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Users & Permission Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage system access, assign roles, and synchronize user contact
            directory.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <RefreshButton onRefetch={refetch} />
          <AuthorityGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <ExportCsvButton
              endpoint="/users/export"
              params={{ search: search || undefined }}
              fallbackFilename={`users-${new Date().toISOString().slice(0, 10)}.csv`}
            />
            <Button
              variant="primary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Invite User
            </Button>
          </AuthorityGuard>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-500" />
          {successMessage}
        </div>
      )}

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
              loading={isLoading}
            />
            <StatsCard
              title="System Administrators"
              value={superAdmins.toLocaleString()}
              change="ADMINS"
              trend="neutral"
              icon={Shield}
              color="cyan"
              loading={isLoading}
            />
            <StatsCard
              title="Coordinators & Desk Staff"
              value={deskStaff.toLocaleString()}
              change="COORDINATORS"
              trend="neutral"
              icon={Lock}
              color="amber"
              loading={isLoading}
            />
          </StatsCardGroup>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
                activeTab === "users"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Administrator & User Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
                activeTab === "permissions"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              RBAC Role Permission Matrix
            </button>
          </div>

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
              onLimitChange={handleLimitChange}
              search={search}
              onSearchChange={handleSearchChange}
              loading={isLoading}
            />
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
        </>
      ) : (
        /* Team Access & Onboarding Notice Card for Non-Super Admins */
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm my-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              Team Access & Onboarding
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Ready to add someone new to the team? You can invite new team
              members anytime using the{" "}
              <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Invite User
              </strong>{" "}
              button above. To review the full directory or request role updates
              for existing users, please contact a Super Administrator.
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
        display={isCreateOpen}
        close={() => setIsCreateOpen(false)}
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
        display={!!editingUser}
        close={() => setEditingUser(null)}
      >
        {editingUser && (
          <UserForm
            initialValues={editingUser}
            onSubmit={handleEditSubmit}
            onDelete={() => setDeletingUser(editingUser)}
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
