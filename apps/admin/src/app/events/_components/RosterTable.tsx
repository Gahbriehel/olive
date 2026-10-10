"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { type IRegistration } from "@/models/registration";

const ROSTER_PAGE_SIZES = [10, 25, 50];

/** Client-paginated attendee roster (data is already fully loaded). */
export function RosterTable({ members }: { members: IRegistration[] }) {
  const columns = useMemo<ColumnDef<IRegistration>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-muted text-fg-secondary font-bold flex items-center justify-center text-2xs shrink-0">
              {row.original.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-fg">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="space-y-0.5 text-2xs text-fg-muted">
              {m.email && m.email !== "N/A" && (
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-fg-subtle" />
                  {m.email}
                </p>
              )}
              {m.phone && m.phone !== "N/A" && (
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-fg-subtle" />
                  {m.phone}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "registrationNumber",
        header: "Reg #",
        cell: ({ row }) => (
          <span className="font-mono text-2xs text-fg-secondary">
            {row.original.registrationNumber}
          </span>
        ),
      },
      {
        accessorKey: "membershipStatus",
        header: "Membership",
        cell: ({ row }) => (
          <StatusBadge status={row.original.membershipStatus} size="sm" />
        ),
      },
      {
        accessorKey: "status",
        header: () => <span className="block text-right">Check-in Status</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <StatusBadge status={row.original.status} size="sm" />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <Table
      columns={columns}
      data={members}
      enableSearch={false}
      defaultPageSize={10}
      pageSizeOptions={ROSTER_PAGE_SIZES}
    />
  );
}
