import { type JSX } from "react";

interface SelectPaginationProps {
  currentPage: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function SelectPagination({
  currentPage,
  totalCount,
  limit,
  onPageChange,
}: SelectPaginationProps): JSX.Element {
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="sticky -top-1 z-10 border-b border-gray-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            disabled={currentPage <= 1}
            className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            disabled={currentPage >= totalPages}
            className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
