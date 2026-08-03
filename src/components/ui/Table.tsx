"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

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
  // Server-side pagination & search props
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
}: TableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState(search ?? "");
  const debouncedSearch = useDebouncedSearch(searchInput, 400);
  const [globalFilter, setGlobalFilter] = useState("");

  const isServerPaginated = Boolean(onPageChange || meta);
  const isServerSearch = Boolean(onSearchChange);

  const prevSearchRef = React.useRef(search);

  useEffect(() => {
    if (search !== undefined && search !== prevSearchRef.current) {
      setSearchInput(search);
      prevSearchRef.current = search;
    }
  }, [search]);

  // Sync debounced search to server callback or TanStack global filter
  useEffect(() => {
    if (isServerSearch && onSearchChange) {
      onSearchChange(debouncedSearch);
    } else {
      setGlobalFilter(debouncedSearch);
    }
  }, [debouncedSearch, isServerSearch, onSearchChange]);

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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      {/* Search Header Bar */}
      {enableSearch && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 text-xs h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:border-indigo-500"
            />
          </div>
          {searchInput && (
            <span className="text-[11px] text-slate-400 animate-fade-in">
              {searchInput !== debouncedSearch ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                </span>
              ) : (
                `Filtered results: ${totalItems}`
              )}
            </span>
          )}
        </div>
      )}

      {/* Table Structure */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800 select-none">
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
                            ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                            <span className="text-slate-400 dark:text-zinc-500">
                              {isSorted === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              ) : isSorted === "desc" ? (
                                <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-3.5 align-middle text-slate-700 dark:text-slate-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-12 text-center text-slate-400 dark:text-slate-500"
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
          <div className="p-3.5 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {startItem}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {endItem}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {totalItems}
                </span>{" "}
                results
              </span>

              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Rows:</span>
                <select
                  value={currentLimit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none"
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
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={!canGoPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 text-xs">
                Page{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {totalPages}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={!canGoNext}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
