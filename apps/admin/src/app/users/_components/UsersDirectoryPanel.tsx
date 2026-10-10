import { UserPlus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table, type TableProps } from "@/components/ui/Table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { IQueryParams } from "@/models";
import { IAdminUser } from "@/models/dashboard";

type DirectoryTableProps = Pick<
  TableProps<IAdminUser, unknown>,
  | "data"
  | "meta"
  | "page"
  | "onPageChange"
  | "limit"
  | "onLimitChange"
  | "search"
  | "onSearchChange"
  | "loading"
  | "isError"
  | "error"
>;

interface UsersDirectoryPanelProps extends DirectoryTableProps {
  columns: ColumnDef<IAdminUser>[];
  /** Refetches the list (toolbar "Refresh" and the error-state retry). */
  onRefresh: () => void;
  onInvite: () => void;
  canManageUsers: boolean;
  exportParams: IQueryParams;
}

export function UsersDirectoryPanel({
  columns,
  onRefresh,
  onInvite,
  canManageUsers,
  exportParams,
  ...tableProps
}: UsersDirectoryPanelProps) {
  return (
    <Table
      {...tableProps}
      columns={columns}
      searchPlaceholder="Search users by name, email, or role..."
      enableSearch={true}
      enablePagination={true}
      defaultPageSize={10}
      emptyMessage="No users found"
      onRetry={onRefresh}
      resource="users"
    >
      <ListToolbar
        create={{
          label: "Invite User",
          onClick: onInvite,
          icon: <UserPlus className="w-4 h-4" />,
          show: canManageUsers,
        }}
        actions={[
          { title: "Refresh", fn: onRefresh },
          ...(canManageUsers
            ? [
                {
                  title: "Export CSV",
                  fn: () =>
                    downloadCsvExport(
                      "/users/export",
                      exportParams,
                      `users-${new Date().toISOString().slice(0, 10)}.csv`,
                    ),
                },
              ]
            : []),
        ]}
      />
    </Table>
  );
}
