import { useCallback, useMemo, useState } from "react";
import { type IQueryParams } from "@/models/base";
import {
  countActiveFilters,
  filterValuesToQueryParams,
  type FilterField,
  type FilterValues,
} from "@/models/filters";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

interface Options {
  /** Keep stable (module constant or memoised) — params are derived from it. */
  fields: FilterField[];
  defaultLimit?: number;
  defaultFilters?: FilterValues;
  /** Debounce the table search before it reaches queryParams. Off by default. */
  searchDebounceMs?: number;
}

/**
 * Centralised list state for admin pages: pagination, table search and the
 * filters panel. Filters are applied on submit from FiltersModal; any change
 * to search, limit or filters resets to page 1.
 */
export function useListFilters({
  fields,
  defaultLimit = 10,
  defaultFilters = {},
  searchDebounceMs = 0,
}: Options) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(defaultLimit);
  const [search, setSearchState] = useState("");
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const debouncedSearch = useDebouncedSearch(search, searchDebounceMs);
  const effectiveSearch = searchDebounceMs > 0 ? debouncedSearch : search;

  const setSearch = useCallback((next: string) => {
    setSearchState((prev) => {
      if (prev !== next) setPage(1);
      return next;
    });
  }, []);

  const setLimit = useCallback((next: number) => {
    setLimitState(next);
    setPage(1);
  }, []);

  const applyFilters = useCallback((next: FilterValues) => {
    setFilters(next);
    setPage(1);
    setIsPanelOpen(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const filterParams = useMemo(
    () => filterValuesToQueryParams(fields, filters),
    [fields, filters],
  );

  const exportParams = useMemo<IQueryParams>(
    () => ({ search: effectiveSearch || undefined, ...filterParams }),
    [effectiveSearch, filterParams],
  );

  const queryParams = useMemo<IQueryParams>(
    () => ({ page, limit, ...exportParams }),
    [page, limit, exportParams],
  );

  const activeCount = useMemo(
    () => countActiveFilters(fields, filters),
    [fields, filters],
  );

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    filters,
    applyFilters,
    clearFilters,
    activeCount,
    queryParams,
    exportParams,
    openPanel,
    panelProps: {
      display: isPanelOpen,
      close: closePanel,
      fields,
      values: filters,
      onApply: applyFilters,
      onClear: clearFilters,
    },
  };
}
