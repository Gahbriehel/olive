"use client";

import { useState, useMemo } from "react";
import { BirthdayPersonItem, BirthdayStatusFilter } from "@/models/birthday";
import { useAuth } from "@/hooks/useAuth";
import { useListFilters } from "@/hooks/useListFilters";
import { useBirthdayAnalytics, useBirthdays } from "@/hooks/useBirthdays";
import { getUserRoles, ROLES } from "@/utils/rbac";

/** All state and queries behind the birthday report page. */
export function useBirthdaysReport() {
  const { user } = useAuth();
  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );
  const [statusFilter, setStatusFilter] = useState<BirthdayStatusFilter>(
    BirthdayStatusFilter.ALL,
  );
  // Pagination + table search. Year, month and status stay page state: they
  // drive the analytics cards too, not just the list.
  const filters = useListFilters({});
  const { page, setPage, limit, search } = filters;

  // Selected person drives modal open/close
  const [emailTarget, setEmailTarget] = useState<BirthdayPersonItem | null>(
    null,
  );
  const [viewTarget, setViewTarget] = useState<BirthdayPersonItem | null>(null);

  const changeYear = (year: number) => {
    setSelectedYear(year);
    setPage(1);
  };

  const setMonthFilter = (month: number | null) => {
    setSelectedMonth(month);
    setPage(1);
  };

  const changeStatus = (status: BirthdayStatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const analytics = useBirthdayAnalytics({
    year: selectedYear,
    month: selectedMonth,
  });

  const list = useBirthdays({
    year: selectedYear,
    month: selectedMonth,
    status: statusFilter,
    search,
    page,
    limit,
  });

  const refetchAll = () => Promise.all([analytics.refetch(), list.refetch()]);

  return {
    isSuperAdmin,
    currentYear,
    selectedYear,
    changeYear,
    selectedMonth,
    setMonthFilter,
    statusFilter,
    changeStatus,
    filters,
    analytics,
    list,
    refetchAll,
    emailTarget,
    setEmailTarget,
    viewTarget,
    setViewTarget,
  };
}
