import { ColumnDef } from "@tanstack/react-table";
import { ActionsList } from "@/components/ui/ActionsList";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { IAdminUser } from "@/models/dashboard";

interface UserColumnsOptions {
  page: number;
  limit: number;
  onEdit: (user: IAdminUser) => void;
  onDelete: (user: IAdminUser) => void;
}

export function getUserColumns({
  page,
  limit,
  onEdit,
  onDelete,
}: UserColumnsOptions): ColumnDef<IAdminUser>[] {
  return [
    {
      id: "s/n",
      header: "S/N",
      // Number across pages, not just within the current one.
      accessorFn: (_, rowIndex) =>
        padNumberWithZeros((page - 1) * limit + rowIndex + 1),
    },
    {
      accessorKey: "name",
      header: "Administrator / User",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {getInitials(u.name)}
            </div>
            <div>
              <p className="font-bold text-fg">{capitalizeWords(u.name)}</p>
              <TruncatedTextWithCopy
                text={u.email}
                maxLength={28}
                textClassName="text-2xs text-fg-muted"
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
        <Badge variant="indigo" className="uppercase text-2xs font-bold">
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
        <span className="text-fg-muted text-xs">{row.original.lastActive}</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end">
            <ActionsList
              actions={[
                { title: "Edit User", fn: () => onEdit(u) },
                {
                  title: "Delete User",
                  fn: () => onDelete(u),
                  destructive: true,
                },
              ]}
            />
          </div>
        );
      },
    },
  ];
}
