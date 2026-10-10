"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { Spinner } from "@/components/ui/Spinner";

export interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  className?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  loading?: boolean;
  children?: ReactNode;
}

export function Table<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  enableSearch = true,
  enablePagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = "No data available",
  className = "",
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
  loading = false,
  children,
}: TableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState(search ?? "");
  const debouncedSearch = useDebouncedSearch(searchInput, 400);
  const [globalFilter, setGlobalFilter] = useState("");

  const isServerPaginated = Boolean(onPageChange || meta);
  const isServerSearch = Boolean(onSearchChange);

  const prevSearchRef = React.useRef(search);
  const onSearchChangeRef = React.useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  const prevDebouncedSearchRef = React.useRef(debouncedSearch);

  useEffect(() => {
    if (search !== undefined && search !== prevSearchRef.current) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
  }, [search]);

  // Sync debounced search to server callback or TanStack global filter
  useEffect(() => {
    if (isServerSearch && onSearchChangeRef.current) {
      if (prevDebouncedSearchRef.current !== debouncedSearch) {
        prevDebouncedSearchRef.current = debouncedSearch;
        onSearchChangeRef.current(debouncedSearch);
      }
    } else if (!isServerSearch) {
      setGlobalFilter(debouncedSearch);
    }
  }, [debouncedSearch, isServerSearch]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: isServerSearch ? "" : globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: isServerSearch ? undefined : setGlobalFilter,
    // Sorting a server page would only reorder the visible rows while looking
    // like a full-dataset sort, so it stays off until the API accepts sort params.
    enableSorting: !isServerPaginated,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isServerPaginated ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSearch ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !isServerPaginated
        ? getPaginationRowModel()
        : undefined,
    manualPagination: isServerPaginated,
    manualFiltering: isServerSearch,
    initialState: {
      pagination: {
        pageSize: limit ?? defaultPageSize,
      },
    },
  });

  // Calculate pagination details for server vs client
  const currentPage = isServerPaginated
    ? (meta?.page ?? page ?? 1)
    : table.getState().pagination.pageIndex + 1;

  const currentLimit = isServerPaginated
    ? (meta?.limit ?? limit ?? defaultPageSize)
    : table.getState().pagination.pageSize;

  const totalItems = isServerPaginated
    ? (meta?.total ?? data.length)
    : table.getFilteredRowModel().rows.length;

  const totalPages = isServerPaginated
    ? (meta?.totalPages ??
      (totalItems > 0 ? Math.ceil(totalItems / currentLimit) : 1))
    : table.getPageCount();

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const endItem = Math.min(currentPage * currentLimit, totalItems);

  const canGoPrevious = isServerPaginated
    ? currentPage > 1
    : table.getCanPreviousPage();
  const canGoNext = isServerPaginated
    ? currentPage < totalPages
    : table.getCanNextPage();

  const handlePageChange = (newPage: number) => {
    if (isServerPaginated && onPageChange) {
      onPageChange(newPage);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
      onPageChange?.(1);
    } else {
      table.setPageSize(newLimit);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar + Search Header Bar */}
      {(children || enableSearch) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {children}
          {enableSearch && (
            <div className="flex items-center gap-3 sm:ml-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 text-base h-9 bg-surface border-border focus:border-primary"
                />
              </div>
              {searchInput && (
                <span className="text-2xs text-fg-subtle animate-fade-in shrink-0">
                  {searchInput !== debouncedSearch ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
                    </span>
                  ) : (
                    `Filtered: ${totalItems}`
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table Structure */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-subtle text-fg-muted font-semibold border-b border-border select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={`p-3.5 ${
                          canSort
                            ? "cursor-pointer hover:bg-muted transition-colors"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {canSort && (
                            <span className="text-fg-subtle">
                              {isSorted === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary-text" />
                              ) : isSorted === "desc" ? (
                                <ArrowDown className="w-3.5 h-3.5 text-primary-text" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-12 text-center text-fg-subtle"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Spinner size="lg" />
                      <p className="font-semibold text-xs text-primary-text">
                        Loading records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-subtle transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-3.5 align-middle text-fg-secondary"
                      >
                        {!["select", "image", "actions", "s/n", "sn"].includes(
                          cell.column.id,
                        ) &&
                        (cell.getValue() === null ||
                          cell.getValue() === undefined ||
                          cell.getValue() === "") ? (
                          <NotAvailable />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-12 text-center text-fg-subtle"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 opacity-40" />
                      <p className="font-medium text-xs">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {enablePagination && totalPages > 0 && (
          <div className="p-3.5 border-t border-border bg-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-muted">
            <div className="flex items-center gap-4">
              <span>
                Showing{" "}
                <span className="font-semibold text-fg">{startItem}</span> to{" "}
                <span className="font-semibold text-fg">{endItem}</span> of{" "}
                <span className="font-semibold text-fg">{totalItems}</span>{" "}
                results
              </span>

              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs">Rows:</span>
                <select
                  value={currentLimit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-surface-raised border border-border-control rounded-lg text-base py-1 px-2 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={!canGoPrevious}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs">
                Page{" "}
                <span className="font-semibold text-fg">{currentPage}</span> of{" "}
                <span className="font-semibold text-fg">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={!canGoNext}
                className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
