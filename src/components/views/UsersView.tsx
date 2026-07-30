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
import { Badge } from "@/components/ui/Badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { AdminUser } from "@/types/dashboard";
import { ColumnDef } from "@tanstack/react-table";

interface UsersViewProps {
  users: AdminUser[];
}

export const UsersView: React.FC<UsersViewProps> = ({ users }) => {
  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const superAdmins = users.filter((u) => u.role === "Super Admin").length;
  const deskStaff = users.filter((u) => u.role === "Registration Desk").length;

  const userColumns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Administrator",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
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
      cell: ({ row }) => <Badge variant="indigo">{row.original.role}</Badge>,
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
        <span className="text-slate-500">{row.original.lastActive}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="sm">
            Edit Role
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
      header: () => <div className="text-center">Super Admin</div>,
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
      header: () => <div className="text-center">Church Admin</div>,
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
      header: () => <div className="text-center">Registration Desk</div>,
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
      header: () => <div className="text-center">Games Coordinator</div>,
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
            Manage administrative access for pastoral staff, church admins, desk
            volunteers, and game referees.
          </p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
          Invite Administrator
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Admins"
          value={totalUsers.toLocaleString()}
          change="Configured accounts"
          trend="neutral"
          icon={UsersIcon}
          color="indigo"
        />
        <StatsCard
          title="Active Today"
          value={activeUsers.toLocaleString()}
          change="Logged in recently"
          trend="up"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatsCard
          title="Super Admins"
          value={superAdmins.toLocaleString()}
          change="Full system access"
          trend="neutral"
          icon={Shield}
          color="cyan"
        />
        <StatsCard
          title="Registration Desk Staff"
          value={deskStaff.toLocaleString()}
          change="Check-in access"
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
          Administrator Users ({users.length})
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
          searchPlaceholder="Search administrator users..."
          enableSearch={true}
          enablePagination={true}
          defaultPageSize={10}
          emptyMessage="No administrators found"
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
    </div>
  );
};
