"use client";

import { useState, useMemo } from "react";
import { EmailBounce, EmailBounceTabFilter } from "@/models/emailBounce";
import { useAuth } from "@/hooks/useAuth";
import { useListFilters } from "@/hooks/useListFilters";
import {
  useEmailBounceAnalytics,
  useEmailBounces,
  useResolveEmailBounce,
} from "@/hooks/useEmailBounces";
import { getUserRoles, ROLES } from "@/utils/rbac";
import { bounceFilterFields, tabQueryParams } from "./bounceConfig";

/** All state and queries behind the email bounces report page. */
export function useBouncesReport() {
  const { user } = useAuth();
  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const canManage =
    userRoles.includes(ROLES.SUPER_ADMIN) || userRoles.includes(ROLES.ADMIN);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Global time filter: drives both analytics and (via page reset) the table
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );

  const [tabFilter, setTabFilter] = useState<EmailBounceTabFilter>(
    EmailBounceTabFilter.ALL,
  );
  const filters = useListFilters({ fields: bounceFilterFields });
  const { page, limit, setPage, queryParams, exportParams } = filters;
  const { emailType, recipientType } = queryParams;

  const [selectedBounce, setSelectedBounce] = useState<EmailBounce | null>(
    null,
  );
  const [remediateTarget, setRemediateTarget] = useState<EmailBounce | null>(
    null,
  );
  const [resolveTarget, setResolveTarget] = useState<EmailBounce | null>(null);

  const analytics = useEmailBounceAnalytics({
    year: selectedYear,
    month: selectedMonth,
    emailType,
    recipientType,
  });

  // Table query = shared list filters + the active status tab
  const computedQueryParams = useMemo(
    () => ({ ...queryParams, ...tabQueryParams[tabFilter] }),
    [queryParams, tabFilter],
  );
  const computedExportParams = useMemo(
    () => ({ ...exportParams, ...tabQueryParams[tabFilter] }),
    [exportParams, tabFilter],
  );

  const list = useEmailBounces(computedQueryParams);
  const { bounces, response: bounceResponse } = list;

  const meta = useMemo(
    () => ({
      total: bounceResponse?.total ?? bounces.length,
      page: bounceResponse?.page ?? page,
      limit: bounceResponse?.limit ?? limit,
      totalPages: bounceResponse?.totalPages ?? 1,
    }),
    [
      bounceResponse?.total,
      bounceResponse?.page,
      bounceResponse?.limit,
      bounceResponse?.totalPages,
      bounces.length,
      page,
      limit,
    ],
  );

  const refreshAll = () => {
    analytics.refetch();
    list.refetch();
  };

  // Mark resolved (always confirmed first via resolveTarget)
  const resolveMutation = useResolveEmailBounce({
    onSuccess: (updated) => {
      if (selectedBounce?.id === updated.id) {
        setSelectedBounce((prev) => (prev ? { ...prev, ...updated } : null));
      }
    },
  });

  // Summary metrics from analytics, or a local fallback from the loaded page
  const summary = useMemo(
    () =>
      analytics.analytics?.summary || {
        totalSent: 0,
        totalBounces: meta.total,
        resolvedBounces: bounces.filter((b) => b.isResolved).length,
        unresolvedBounces: bounces.filter((b) => !b.isResolved).length,
        bounceRate: 0,
        resolutionRate: 0,
        deliveryRate: 100,
      },
    [analytics.analytics?.summary, meta.total, bounces],
  );

  const changeYear = (year: number) => {
    setSelectedYear(year);
    setPage(1);
  };

  const changeTab = (tab: EmailBounceTabFilter) => {
    setTabFilter(tab);
    setPage(1);
  };

  return {
    canManage,
    currentYear,
    selectedYear,
    changeYear,
    selectedMonth,
    setSelectedMonth,
    tabFilter,
    changeTab,
    filters,
    analytics,
    list,
    meta,
    summary,
    computedExportParams,
    refreshAll,
    selectedBounce,
    setSelectedBounce,
    remediateTarget,
    setRemediateTarget,
    resolveTarget,
    setResolveTarget,
    resolveMutation,
  };
}
