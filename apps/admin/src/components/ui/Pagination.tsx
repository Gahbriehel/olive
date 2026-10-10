"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/helpers/cn";
import { Button } from "@/components/ui/Button";

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Omit to hide the rows-per-page selector. */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

/** "Showing x–y of n" + rows-per-page + first/prev/next/last. Used by Table and card-grid lists. */
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className,
}: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < pages;

  const nav = [
    { label: "First page", icon: ChevronsLeft, to: 1, enabled: canPrev },
    {
      label: "Previous page",
      icon: ChevronLeft,
      to: page - 1,
      enabled: canPrev,
    },
    { label: "Next page", icon: ChevronRight, to: page + 1, enabled: canNext },
    { label: "Last page", icon: ChevronsRight, to: pages, enabled: canNext },
  ];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 text-xs text-fg-muted sm:flex-row",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        <span aria-live="polite">
          Showing <span className="font-semibold text-fg">{start}</span> to{" "}
          <span className="font-semibold text-fg">{end}</span> of{" "}
          <span className="font-semibold text-fg">{totalItems}</span> results
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-border-control bg-surface-raised px-2 py-1 text-base text-fg outline-none focus:ring-2 focus:ring-primary/30 sm:text-xs"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        {nav.slice(0, 2).map(({ label, icon: Icon, to, enabled }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={label}
            title={label}
            disabled={!enabled}
            onClick={() => onPageChange(to)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <span className="px-2">
          Page <span className="font-semibold text-fg">{page}</span> of{" "}
          <span className="font-semibold text-fg">{pages}</span>
        </span>
        {nav.slice(2).map(({ label, icon: Icon, to, enabled }) => (
          <Button
            key={label}
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={label}
            title={label}
            disabled={!enabled}
            onClick={() => onPageChange(to)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </nav>
    </div>
  );
}
