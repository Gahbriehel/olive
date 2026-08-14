import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { AdminUser } from "@/models/dashboard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getInitials,
  truncateString,
  capitalizeWords,
} from "@/utils/formatters";

interface GetUserColumnsProps {
  onEditUser: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
}

export function getUserColumns({
  onEditUser,
  onDeleteUser,
}: GetUserColumnsProps): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "name",
      header: "Administrator / User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {capitalizeWords(user.name)}
              </p>
              <p className="text-[11px] text-slate-400" title={user.email}>
                {truncateString(user.email, 28)}
              </p>
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(row.original)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          {onDeleteUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteUser(row.original)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];
}
