import { ColumnDef } from "@tanstack/react-table";
import { Table, type TableProps } from "@/components/ui/Table";
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
  | "onRowClick"
>;

interface UsersDirectoryPanelProps extends DirectoryTableProps {
  columns: ColumnDef<IAdminUser>[];
  /** Refetches the list (error-state retry). */
  onRefresh: () => void;
}

export function UsersDirectoryPanel({
  columns,
  onRefresh,
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
    />
  );
}
