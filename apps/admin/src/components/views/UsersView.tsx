import React, { useState } from "react";
import {
  Check,
  X,
  UserPlus,
  Shield,
  Users as UsersIcon,
  ShieldCheck,
  Lock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ColumnDef } from "@tanstack/react-table";
import { getUserColumns } from "./users/users-columns";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES } from "@/utils/rbac";
import {
  AdminUser,
  ICreateUserPayload,
  IUpdateUserPayload,
} from "@/models/dashboard";
import { useUsers } from "@/hooks/useUsers";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { UserForm, UserFormValues } from "@/components/Forms/UserForm";

interface UsersViewProps {
  users?: AdminUser[];
  onCreateUser?: (payload: ICreateUserPayload) => Promise<unknown> | void;
  onUpdateUser?: (
    id: string,
    payload: IUpdateUserPayload,
  ) => Promise<unknown> | void;
  onDeleteUser?: (id: string) => Promise<unknown> | void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  onRefetch?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users: propUsers,
  onCreateUser: propOnCreateUser,
  onUpdateUser: propOnUpdateUser,
  onDeleteUser: propOnDeleteUser,
  isCreating: propIsCreating = false,
  isUpdating: propIsUpdating = false,
  isDeleting: propIsDeleting = false,
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
  onRefetch,
}) => {
  const {
    users: hookUsers,
    createUser: hookCreateUser,
    updateUser: hookUpdateUser,
    deleteUser: hookDeleteUser,
    isCreating: hookIsCreating,
    isUpdating: hookIsUpdating,
    isDeleting: hookIsDeleting,
  } = useUsers();

  const users = propUsers && propUsers.length > 0 ? propUsers : hookUsers;
  const isCreating = propIsCreating || hookIsCreating;
  const isUpdating = propIsUpdating || hookIsUpdating;
  const isDeleting = propIsDeleting || hookIsDeleting;

  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
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
      if (propOnCreateUser) {
        await propOnCreateUser(payload);
      } else {
        await hookCreateUser(payload);
      }
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
      if (propOnUpdateUser) {
        await propOnUpdateUser(editingUser.id, payload);
      } else {
        await hookUpdateUser({ id: editingUser.id, payload });
      }
      setEditingUser(null);
      showNotification("User account & roles updated successfully!");
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeletePerform = async () => {
    if (!deletingUser) return;

    try {
      if (propOnDeleteUser) {
        await propOnDeleteUser(deletingUser.id);
      } else {
        await hookDeleteUser(deletingUser.id);
      }
      setDeletingUser(null);
      if (editingUser?.id === deletingUser.id) {
        setEditingUser(null);
      }
      showNotification("User account deleted successfully.");
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const totalUsers = users.length;
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

  const userColumns = React.useMemo(
    () =>
      getUserColumns({
        onEditUser: (user) => setEditingUser(user),
        onDeleteUser: (user) => setDeletingUser(user),
      }),
    [],
  );

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

  const permissionColumns: ColumnDef<PermissionMatrixItem>[] = [
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
  ];

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
          <RefreshButton onRefetch={onRefetch} />
          <AuthorityGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total System Users"
          value={totalUsers.toLocaleString()}
          change="Admin accounts"
          trend="neutral"
          icon={UsersIcon}
          color="indigo"
        />
        <StatsCard
          title="Active Accounts"
          value={activeUsers.toLocaleString()}
          change="Logged in recently"
          trend="up"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatsCard
          title="System Administrators"
          value={superAdmins.toLocaleString()}
          change="ADMINS"
          trend="neutral"
          icon={Shield}
          color="cyan"
        />
        <StatsCard
          title="Coordinators & Desk Staff"
          value={deskStaff.toLocaleString()}
          change="COORDINATORS"
          trend="neutral"
          icon={Lock}
          color="amber"
        />
      </div>

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
          onPageChange={onPageChange}
          limit={limit}
          onLimitChange={onLimitChange}
          search={search}
          onSearchChange={onSearchChange}
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
};
