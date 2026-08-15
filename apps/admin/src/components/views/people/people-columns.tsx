import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Person } from "@/models/person";
import { ActionsList } from "@/components/ui/ActionsList";
import { Badge } from "@/components/ui/Badge";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";

interface GetPeopleColumnsProps {
  onSelectPerson: (person: Person) => void;
}

export function getPeopleColumns({
  onSelectPerson,
}: GetPeopleColumnsProps): ColumnDef<Person>[] {
  return [
    {
      accessorKey: "name",
      header: "Person",
      cell: ({ row }) => {
        const person = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(person.name)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {capitalizeWords(person.name)}
              </p>
              <p className="text-[11px] text-slate-400">ID: {person.id}</p>
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
            textClassName="font-medium text-slate-900 dark:text-slate-200"
          />
          <p className="text-[11px] text-slate-400">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender / DOB",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.gender}</p>
          <p className="text-[11px] text-slate-400">DOB: {row.original.dob}</p>
        </div>
      ),
    },
    {
      accessorKey: "membershipStatus",
      header: "Membership",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.membershipStatus === "Member" ? "indigo" : "amber"
          }
          size="sm"
        >
          {row.original.membershipStatus}
        </Badge>
      ),
    },
    {
      accessorKey: "registrationHistoryCount",
      header: "Events Registered",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {row.original.registrationHistoryCount} Events
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsList
          actions={[
            {
              title: "View Details",
              fn: () => onSelectPerson(row.original),
            },
          ]}
        />
      ),
    },
  ];
}
