import React, { useState } from "react";
import {
  Check,
  X,
  UserPlus,
  Shield,
  Users as UsersIcon,
  ShieldCheck,
  Lock,
  Edit2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { AdminUser, IUpdateUserPayload } from "@/models/dashboard";
import { ColumnDef } from "@tanstack/react-table";
import { useUsers } from "@/hooks/useUsers";

interface UsersViewProps {
  users?: AdminUser[];
  onUpdateUser?: (
    id: string,
    payload: IUpdateUserPayload,
  ) => Promise<unknown> | void;
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
}

export const UsersView: React.FC<UsersViewProps> = ({
  users: propUsers,
  onUpdateUser: propOnUpdateUser,
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
}) => {
  const {
    users: hookUsers,
    updateUser: hookUpdateUser,
    isUpdating,
  } = useUsers();
  const users = propUsers && propUsers.length > 0 ? propUsers : hookUsers;

  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Edit form state
  const [role, setRole] = useState("MEMBER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setRole(user.role || "MEMBER");
    setFirstName(user.firstName || user.name.split(" ")[0] || "");
    setLastName(user.lastName || user.name.split(" ").slice(1).join(" ") || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload: IUpdateUserPayload = {
      role,
      firstName,
      lastName,
      email,
      phone,
    };

    try {
      if (propOnUpdateUser) {
        await propOnUpdateUser(editingUser.id, payload);
      } else {
        await hookUpdateUser({ id: editingUser.id, payload });
      }
      setSavedSuccess(true);
      setEditingUser(null);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const superAdmins = users.filter(
    (u) =>
      u.role === "SUPER_ADMIN" ||
      u.role === "ADMIN" ||
      u.role === "Super Admin",
  ).length;
  const deskStaff = users.filter(
    (u) =>
      u.role === "WORKER" ||
      u.role === "LEADER" ||
      u.role === "Registration Desk",
  ).length;

  const userColumns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Administrator / User",
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
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
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "Active" ? "emerald" : "slate"}
          dot
        >
          {row.original.status}
        </Badge>
      ),
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
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row.original)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Role & Info
          </Button>
        </div>
      ),
    },
  ];

  interface PermissionMatrixItem {
    feature: string;
    superAdmin: boolean;
    churchAdmin: boolean;
    regDesk: boolean;
    gamesCoord: boolean;
  }

  const permissionsMatrix: PermissionMatrixItem[] = [
    {
      feature: "Create & Edit Events",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "Publish / Delete Events",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "Manage Registrations & Export CSV",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: false,
    },
    {
      feature: "Reassign Attendee Teams",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: false,
    },
    {
      feature: "Scan QR Badges & Manual Check-in",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: true,
    },
    {
      feature: "Submit Game Scores & Update Points",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: true,
    },
    {
      feature: "Manage Admin Users & Roles",
      superAdmin: true,
      churchAdmin: false,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "System Settings & Branding",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
  ];

  const permissionColumns: ColumnDef<PermissionMatrixItem>[] = [
    {
      accessorKey: "feature",
      header: "Feature Capability",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.original.feature}
        </span>
      ),
    },
    {
      accessorKey: "superAdmin",
      header: () => <div className="text-center">Super Admin / Admin</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.superAdmin ? (
            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
          ) : (
            <X className="w-4 h-4 text-slate-300 mx-auto" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "churchAdmin",
      header: () => <div className="text-center">Leader</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.churchAdmin ? (
            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
          ) : (
            <X className="w-4 h-4 text-slate-300 mx-auto" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "regDesk",
      header: () => <div className="text-center">Worker</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.regDesk ? (
            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
          ) : (
            <X className="w-4 h-4 text-slate-300 mx-auto" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "gamesCoord",
      header: () => <div className="text-center">Member</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.gamesCoord ? (
            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
          ) : (
            <X className="w-4 h-4 text-slate-300 mx-auto" />
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
            Manage system access, assign roles (ADMIN, LEADER, WORKER, MEMBER),
            and synchronize user contact directory.
          </p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
          Invite User
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          User role and directory synchronized successfully!
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total System Users"
          value={totalUsers.toLocaleString()}
          change="Configured accounts"
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
          title="Admins & Leaders"
          value={superAdmins.toLocaleString()}
          change="Management access"
          trend="neutral"
          icon={Shield}
          color="cyan"
        />
        <StatsCard
          title="Workers & Members"
          value={deskStaff.toLocaleString()}
          change="Directory members"
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Update User & Role Transition
                </h2>
                <p className="text-xs text-slate-500">
                  Modifying role updates directory sync automatically
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 123 4567 890"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assign System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ADMIN">ADMIN - Full Control</option>
                  <option value="LEADER">LEADER - Event Manager</option>
                  <option value="WORKER">WORKER - Registration & Desk</option>
                  <option value="MEMBER">MEMBER - Member Account</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isUpdating}
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  Save Role Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
