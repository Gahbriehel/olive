import { Check, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";

interface PermissionMatrixItem {
  item: string;
  route: string;
  superAdmin: boolean;
  churchAdmin: boolean;
  coordinator: boolean;
  regDesk: boolean;
}

type RoleColumnKey = "superAdmin" | "churchAdmin" | "coordinator" | "regDesk";

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

const ROLE_COLUMNS: { key: RoleColumnKey; label: string; roleKey: string }[] = [
  { key: "superAdmin", label: "Super Admin", roleKey: "SUPER_ADMIN" },
  { key: "churchAdmin", label: "Church Admin", roleKey: "ADMIN" },
  { key: "coordinator", label: "Event Coordinator", roleKey: "COORDINATOR" },
  { key: "regDesk", label: "Registration Desk", roleKey: "REGISTRATION_DESK" },
];

const permissionColumns: ColumnDef<PermissionMatrixItem>[] = [
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
        <p className="text-2xs font-mono text-fg-muted">{row.original.route}</p>
      </div>
    ),
  },
  ...ROLE_COLUMNS.map(
    ({ key, label, roleKey }): ColumnDef<PermissionMatrixItem> => ({
      accessorKey: key,
      header: () => (
        <div className="text-center">
          <p className="font-bold text-fg">{label}</p>
          <span className="text-2xs font-mono text-primary-text">
            {roleKey}
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original[key] ? (
            <Check className="w-4 h-4 text-success-text mx-auto" />
          ) : (
            <X className="w-4 h-4 text-fg-subtle mx-auto" />
          )}
        </div>
      ),
    }),
  ),
];

export function PermissionsMatrixPanel() {
  return (
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
  );
}
