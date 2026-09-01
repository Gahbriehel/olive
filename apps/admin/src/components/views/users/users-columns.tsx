import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IAdminUser } from "@/models/dashboard";
import { ActionsList } from "@/components/ui/ActionsList";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";

interface GetUserColumnsProps {
  onEditUser: (user: IAdminUser) => void;
  onDeleteUser?: (user: IAdminUser) => void;
}

export function getUserColumns({
  onEditUser,
  onDeleteUser,
}: GetUserColumnsProps): ColumnDef<IAdminUser>[] {
  return [
    {
      id: "s/n",
      header: "S/N",
      accessorFn: (_, rowIndex) => padNumberWithZeros(rowIndex + 1),
    },
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
              <TruncatedTextWithCopy
                text={user.email}
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
        const user = row.original;
        return (
          <div className="flex">
            <ActionsList
              actions={[
                {
                  title: "Edit User",
                  fn: () => onEditUser(user),
                },
                ...(onDeleteUser
                  ? [
                      {
                        title: "Delete User",
                        fn: () => onDeleteUser(user),
                        destructive: true,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];
}
