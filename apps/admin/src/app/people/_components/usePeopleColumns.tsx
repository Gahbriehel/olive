"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionsList } from "@/components/ui/ActionsList";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { IPerson } from "@/models/person";

interface Options {
  page: number;
  limit: number;
  isSuperAdmin: boolean;
  onView: (person: IPerson) => void;
  onEdit: (person: IPerson) => void;
}

/** Column definitions for the people directory table. */
export function usePeopleColumns({
  page,
  limit,
  isSuperAdmin,
  onView,
  onEdit,
}: Options) {
  return useMemo<ColumnDef<IPerson>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) =>
          padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      },
      {
        accessorKey: "name",
        header: "Person",
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(person.name)}
              </div>
              <div>
                <p className="font-bold text-fg">
                  {capitalizeWords(person.name)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => (
          <div>
            <TruncatedTextWithCopy
              text={row.original.email}
              maxLength={28}
              textClassName="font-medium text-fg"
            />
            <p className="text-2xs text-fg-muted">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender / DOB",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.gender}</p>
            <p className="text-2xs text-fg-muted">DOB: {row.original.dob}</p>
          </div>
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
        accessorKey: "registrationHistoryCount",
        header: "Events Registered",
        cell: ({ row }) => (
          <span className="font-semibold text-fg-secondary">
            {row.original.registrationHistoryCount} Events
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const person = row.original;
          const actions = [
            {
              title: "View Details",
              fn: () => {
                onView(person);
              },
            },
          ];

          if (isSuperAdmin) {
            actions.push({
              title: "Edit Person",
              fn: () => {
                onEdit(person);
              },
            });
          }

          return <ActionsList actions={actions} />;
        },
      },
    ],
    [page, limit, isSuperAdmin, onView, onEdit],
  );
}
