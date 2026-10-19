"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Shield, Users } from "lucide-react";
import { ActionsList } from "@/components/ui/ActionsList";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { IDepartment } from "@/models/department";

interface Options {
  page: number;
  limit: number;
  canManage: boolean;
  onViewRoster: (dept: IDepartment) => void;
  onEdit: (dept: IDepartment) => void;
  onDelete: (dept: IDepartment) => void;
}

export function useDepartmentColumns({
  page,
  limit,
  canManage,
  onViewRoster,
  onEdit,
  onDelete,
}: Options) {
  return useMemo<ColumnDef<IDepartment>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) =>
          padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      },
      {
        accessorKey: "name",
        header: "Department",
        cell: ({ row }) => {
          const dept = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary-text flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-bold text-fg">{dept.name}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const desc = row.original.description;
          if (!desc) {
            return (
              <span className="text-2xs text-fg-muted italic">
                No description
              </span>
            );
          }
          return (
            <TruncatedTextWithCopy
              text={desc}
              maxLength={40}
              textClassName="text-fg-secondary text-xs"
            />
          );
        },
      },
      {
        id: "membersCount",
        header: "Active Members",
        accessorFn: (row) => row._count?.members ?? row.members?.length ?? 0,
        cell: ({ row }) => {
          const count =
            row.original._count?.members ?? row.original.members?.length ?? 0;
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-secondary">
              <Users className="w-3.5 h-3.5 text-fg-subtle" />
              {count} {count === 1 ? "Member" : "Members"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const dept = row.original;
          const actions = [
            {
              title: "View Roster",
              fn: () => onViewRoster(dept),
            },
          ];

          if (canManage) {
            actions.push({
              title: "Edit Department",
              fn: () => onEdit(dept),
            });
            actions.push({
              title: "Delete Department",
              fn: () => onDelete(dept),
            });
          }

          return <ActionsList actions={actions} />;
        },
      },
    ],
    [page, limit, canManage, onViewRoster, onEdit, onDelete],
  );
}
