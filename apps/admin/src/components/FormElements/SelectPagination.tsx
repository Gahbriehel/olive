import { type JSX, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SelectPaginationProps {
  currentPage: number;
  /** Total number of items. When omitted, "Page X" is shown and `hasNextPage` decides Next. */
  totalCount?: number;
  limit: number;
  onPageChange: (page: number) => void;
  /** Used when `totalCount` is unknown. */
  hasNextPage?: boolean;
}

const buttonClass =
  "inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-zinc-700 dark:hover:text-slate-200";

/**
 * Prev/next pager rendered at the top of a select's option list. Renders
 * nothing when there is only one page.
 */
export function SelectPagination({
  currentPage,
  totalCount,
  limit,
  onPageChange,
  hasNextPage,
}: SelectPaginationProps): JSX.Element | null {
  const totalKnown = typeof totalCount === "number";
  const totalPages = totalKnown
    ? Math.max(1, Math.ceil(totalCount / Math.max(1, limit)))
    : undefined;
  const canPrev = currentPage > 1;
  const canNext = totalPages ? currentPage < totalPages : !!hasNextPage;

  if (!canPrev && !canNext) return null;

  // Keep focus in the combobox input so the option list stays open.
  const keepFocus = (e: MouseEvent) => e.preventDefault();

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-400">
      <span aria-live="polite">
        Page {currentPage}
        {totalPages ? ` of ${totalPages}` : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={!canPrev}
          onMouseDown={keepFocus}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canPrev) onPageChange(currentPage - 1);
          }}
          className={buttonClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={!canNext}
          onMouseDown={keepFocus}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canNext) onPageChange(currentPage + 1);
          }}
          className={buttonClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
