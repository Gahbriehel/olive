"use client";

import { useState, useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  MailWarning,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Globe,
  Tag,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/QueryState";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { ActionsList, ActionItem } from "@/components/ui/ActionsList";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { ViewBounceDetailsModal } from "@/components/modals/ViewBounceDetailsModal";
import { RemediateBounceModal } from "@/components/modals/RemediateBounceModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { EmailBounce, EmailBounceTabFilter } from "@/models/emailBounce";
import { useAuth } from "@/hooks/useAuth";
import { useListFilters } from "@/hooks/useListFilters";
import {
  useEmailBounceAnalytics,
  useEmailBounces,
  useInvalidateEmailBounces,
  useResolveEmailBounce,
} from "@/hooks/useEmailBounces";
import { type IQueryParams } from "@/models/base";
import { type FilterField } from "@/models/filters";
import { getUserRoles, ROLES } from "@/utils/rbac";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { customToast } from "@/helpers/customToast";
import dayjs from "dayjs";

const columnHelper = createColumnHelper<EmailBounce>();

const bounceFilterFields: FilterField[] = [
  {
    type: "select",
    key: "emailType",
    label: "Email Type",
    allLabel: "All Email Types",
    options: [
      {
        label: "Registration Confirmation",
        value: "REGISTRATION_CONFIRMATION",
      },
      { label: "Custom Broadcast", value: "CUSTOM_BROADCAST" },
      { label: "Admin Welcome", value: "ADMIN_WELCOME" },
    ],
  },
  {
    type: "select",
    key: "recipientType",
    label: "Recipient Type",
    allLabel: "All Recipients",
    options: [
      { label: "Person (Member/Visitor)", value: "PERSON" },
      { label: "User (Admin/Staff)", value: "USER" },
    ],
  },
];

const tabQueryParams: Record<EmailBounceTabFilter, IQueryParams> = {
  [EmailBounceTabFilter.ALL]: {},
  [EmailBounceTabFilter.UNRESOLVED]: { isResolved: false },
  [EmailBounceTabFilter.RESOLVED]: { isResolved: true },
  [EmailBounceTabFilter.HARD_BOUNCE]: { bounceType: "Hard" },
  [EmailBounceTabFilter.SOFT_BOUNCE]: { bounceType: "Soft" },
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EmailBouncesPage() {
  const { user } = useAuth();
  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const canManage =
    userRoles.includes(ROLES.SUPER_ADMIN) || userRoles.includes(ROLES.ADMIN);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Global Time & Analytics Filter States
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );

  // Table Filter States
  const [tabFilter, setTabFilter] = useState<EmailBounceTabFilter>(
    EmailBounceTabFilter.ALL,
  );
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    activeCount,
    queryParams,
    exportParams,
    openPanel,
    panelProps,
  } = useListFilters({ fields: bounceFilterFields });
  const { emailType, recipientType } = queryParams;

  // Modals State
  const [selectedBounce, setSelectedBounce] = useState<EmailBounce | null>(
    null,
  );
  const [remediateTarget, setRemediateTarget] = useState<EmailBounce | null>(
    null,
  );

  // 1. Analytics Data
  const {
    analytics: analyticsData,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useEmailBounceAnalytics({
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

  // 2. Email Bounces List
  const {
    bounces,
    response: bounceResponse,
    isLoading: isListLoading,
    isFetching,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useEmailBounces(computedQueryParams);

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

  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchList();
  };

  // 3. Mark Resolved Mutation
  const invalidateBounces = useInvalidateEmailBounces();
  const resolveMutation = useResolveEmailBounce({
    onSuccess: (updated) => {
      if (selectedBounce?.id === updated.id) {
        setSelectedBounce((prev) => (prev ? { ...prev, ...updated } : null));
      }
      customToast.success("Email bounce marked as resolved");
    },
    onError: () => {
      customToast.error("Failed to mark bounce as resolved");
    },
  });

  // Table Columns Definition
  const columns = useMemo<ColumnDef<EmailBounce>[]>(
    () =>
      [
        columnHelper.accessor("email", {
          header: "Recipient",
          cell: ({ row }) => {
            const item = row.original;
            const initials = (item.recipientName || item.email || "E")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-danger-soft text-danger-text font-bold text-xs flex items-center justify-center shrink-0 border border-danger-border">
                  {initials}
                </div>
                <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.recipientName && (
                      <p className="text-xs font-bold text-fg truncate">
                        {item.recipientName}
                      </p>
                    )}
                    {item.recipientType && (
                      <Badge
                        variant={
                          item.recipientType === "PERSON" ? "indigo" : "cyan"
                        }
                        size="sm"
                        className="text-2xs px-1 py-0"
                      >
                        {item.recipientType}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xs font-mono text-fg-secondary truncate mt-0.5">
                    <TruncatedTextWithCopy
                      text={item.email}
                      maxLength={24}
                      textClassName="text-2xs font-mono text-fg-secondary"
                    />
                  </div>
                </div>
              </div>
            );
          },
        }),

        columnHelper.accessor("bounceType", {
          header: "Classification",
          cell: ({ row }) => {
            const item = row.original;
            const isHard =
              item.bounceType?.toLowerCase() === "hard" ||
              item.eventType?.toLowerCase().includes("failed");

            return (
              <div className="space-y-0.5 whitespace-nowrap">
                <StatusBadge
                  status={isHard ? "BOUNCED" : item.bounceType || "BOUNCED"}
                  size="sm"
                />
                {item.eventType && (
                  <p className="text-2xs text-fg-muted font-mono truncate max-w-[120px]">
                    {item.eventType}
                  </p>
                )}
              </div>
            );
          },
        }),

        columnHelper.accessor("emailType", {
          header: "Context / Template",
          cell: ({ getValue }) => {
            const emailType = getValue();
            if (!emailType) return <NotAvailable />;
            return (
              <div className="max-w-[160px] truncate text-xs font-medium text-fg-secondary">
                <span title={emailType}>{emailType}</span>
              </div>
            );
          },
        }),

        columnHelper.accessor("reason", {
          header: "Diagnostic Reason",
          cell: ({ getValue }) => {
            const reason = getValue();
            if (!reason) return <NotAvailable />;
            return (
              <div className="max-w-[220px] sm:max-w-[280px]">
                <p
                  className="text-xs font-mono text-fg-secondary truncate"
                  title={reason}
                >
                  {reason}
                </p>
              </div>
            );
          },
        }),

        columnHelper.accessor("isResolved", {
          header: "Status",
          cell: ({ getValue }) => {
            const isResolved = getValue();
            if (isResolved) {
              return (
                <Badge
                  variant="emerald"
                  size="sm"
                  className="font-semibold whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </Badge>
              );
            }
            return (
              <Badge
                variant="amber"
                size="sm"
                className="font-semibold whitespace-nowrap"
              >
                <AlertTriangle className="w-3 h-3" /> Action Needed
              </Badge>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Recorded",
          cell: ({ getValue }) => {
            const val = getValue();
            if (!val) return <NotAvailable />;
            return (
              <div className="space-y-0.5 whitespace-nowrap">
                <p className="text-xs font-medium text-fg">
                  {dayjs(val).format("MMM D, YYYY")}
                </p>
                <p className="text-2xs text-fg-muted">
                  {dayjs(val).format("h:mm A")}
                </p>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: ({ row }) => {
            const item = row.original;
            const actions: ActionItem[] = [
              ...(canManage && !item.isResolved
                ? [
                    {
                      title: "Fix & Remediate Email",
                      fn: () => setRemediateTarget(item),
                    },
                    {
                      title: "Mark as Resolved",
                      fn: () => resolveMutation.mutate(item.id),
                    },
                  ]
                : []),
              {
                title: "View Full Diagnostics",
                fn: () => setSelectedBounce(item),
              },
            ];

            return (
              <div className="flex justify-end">
                <ActionsList actions={actions} />
              </div>
            );
          },
        }),
      ] as ColumnDef<EmailBounce>[],
    [canManage, resolveMutation],
  );

  // Summary Metrics computed from Analytics Response or local fallback
  const summary = useMemo(
    () =>
      analyticsData?.summary || {
        totalSent: 0,
        totalBounces: meta.total,
        resolvedBounces: bounces.filter((b) => b.isResolved).length,
        unresolvedBounces: bounces.filter((b) => !b.isResolved).length,
        bounceRate: 0,
        resolutionRate: 0,
        deliveryRate: 100,
      },
    [analyticsData?.summary, meta.total, bounces],
  );

  // Filter Tabs Configuration
  const tabs = useMemo(
    () => [
      {
        id: EmailBounceTabFilter.ALL,
        label: "All Bounces",
        count: summary.totalBounces,
      },
      {
        id: EmailBounceTabFilter.UNRESOLVED,
        label: "Action Needed",
        count: summary.unresolvedBounces,
      },
      {
        id: EmailBounceTabFilter.HARD_BOUNCE,
        label: "Hard Bounces",
        count: analyticsData?.byBounceType?.find(
          (b) => b.category.toLowerCase() === "hard",
        )?.count,
      },
      {
        id: EmailBounceTabFilter.SOFT_BOUNCE,
        label: "Soft Bounces",
        count: analyticsData?.byBounceType?.find(
          (b) => b.category.toLowerCase() === "soft",
        )?.count,
      },
      {
        id: EmailBounceTabFilter.RESOLVED,
        label: "Resolved",
        count: summary.resolvedBounces,
      },
    ],
    [summary, analyticsData],
  );

  // KPI Stats Cards Configuration
  const kpiStats = useMemo(
    () => [
      {
        title: "Delivery Rate",
        value: `${summary.deliveryRate}%`,
        description: `${selectedMonth ? MONTH_NAMES[selectedMonth - 1] : selectedYear} delivery success`,
        icon: ShieldCheck,
        color: "emerald" as const,
        loading: isAnalyticsLoading,
      },
      {
        title: "Total Delivery Failures",
        value: summary.totalBounces,
        description: `Out of ${summary.totalSent.toLocaleString()} sent emails`,
        icon: MailWarning,
        color: "rose" as const,
        loading: isAnalyticsLoading,
      },
      {
        title: "Action Needed",
        value: summary.unresolvedBounces,
        description: "Pending address fix",
        icon: AlertTriangle,
        color: "amber" as const,
        loading: isAnalyticsLoading,
      },
      {
        title: "Resolved Rate",
        value: `${summary.resolutionRate}%`,
        description: `${summary.resolvedBounces} remediated`,
        icon: CheckCircle2,
        color: "indigo" as const,
        loading: isAnalyticsLoading,
      },
      {
        title: "Bounce Rate",
        value: `${summary.bounceRate}%`,
        description: "Target under 2.0%",
        icon: Percent,
        color: summary.bounceRate > 2 ? ("rose" as const) : ("cyan" as const),
        className: "col-span-2 sm:col-span-1",
        loading: isAnalyticsLoading,
      },
    ],
    [summary, selectedMonth, selectedYear, isAnalyticsLoading],
  );

  return (
    <div className="space-y-6 pb-10 min-w-0 max-w-full">
      <PageHeader
        title="Email Bounces & Delivery Issues"
        description="Monitor Resend webhooks, remediate invalid emails, and resend critical communications."
        icon={MailWarning}
        breadcrumbs={[{ label: "Reports" }, { label: "Email Bounces" }]}
        actions={
          <>
            {/* Year Selector (≥16px on mobile to avoid iOS zoom) */}
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-fg-subtle" />
              <select
                aria-label="Year"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setPage(1);
                }}
                className="text-base sm:text-xs font-semibold bg-transparent text-fg focus:outline-none cursor-pointer"
              >
                {[
                  currentYear - 2,
                  currentYear - 1,
                  currentYear,
                  currentYear + 1,
                ].map((yr) => (
                  <option key={yr} value={yr} className="bg-surface">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <RefreshButton onRefetch={handleRefreshAll} />

            {canManage && (
              <ExportCsvButton
                endpoint="/email-bounces/export"
                params={computedExportParams}
                fallbackFilename={`email-bounces-${new Date().toISOString().slice(0, 10)}.csv`}
                label="Export CSV"
              />
            )}
          </>
        }
      />

      {/* KPI Stats Cards */}
      {isAnalyticsError ? (
        <div className="rounded-2xl border border-border bg-surface shadow-xs">
          <ErrorState
            resource="bounce analytics"
            error={analyticsError}
            onRetry={() => refetchAnalytics()}
          />
        </div>
      ) : (
        <StatsCardGroup>
          {kpiStats.map((kpi, idx) => (
            <StatsCard
              key={idx}
              title={kpi.title}
              value={kpi.value}
              change={kpi.description}
              trend="neutral"
              icon={kpi.icon}
              color={kpi.color}
              className={kpi.className}
              loading={kpi.loading}
            />
          ))}
        </StatsCardGroup>
      )}

      {/* Top Failing Domains & Categories Banner */}
      {analyticsData &&
        (analyticsData.topFailingDomains?.length > 0 ||
          analyticsData.byEmailType?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Top Failing Domains */}
            {analyticsData.topFailingDomains?.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-surface/90 border border-border shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fg-secondary flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary-text" />
                    Top Failing Domains
                  </span>
                  <span className="text-2xs text-fg-muted">
                    High bounce rate clusters
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analyticsData.topFailingDomains.map((dom) => (
                    <span
                      key={dom.domain}
                      className="inline-flex items-center gap-1 text-2xs font-mono font-medium px-2 py-0.5 rounded-lg bg-muted text-fg-secondary border border-border-control"
                    >
                      @{dom.domain}
                      <span className="text-danger-text font-bold">
                        ({dom.count})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Email Types Breakdown */}
            {analyticsData.byEmailType?.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-surface/90 border border-border shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fg-secondary flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-info-text" />
                    Failures by Email Type
                  </span>
                  <span className="text-2xs text-fg-muted">
                    Distribution by campaign
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analyticsData.byEmailType.map((em) => (
                    <span
                      key={em.category}
                      className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-lg bg-muted text-fg-secondary border border-border-control"
                    >
                      {em.category}
                      <span className="text-primary-text font-bold">
                        {em.percentage}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Table Section */}
      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div className="overflow-x-auto no-scrollbar max-w-full">
            <Tabs
              tabs={tabs}
              activeTab={tabFilter}
              onChange={(tabId) => {
                setTabFilter(tabId as EmailBounceTabFilter);
                setPage(1);
              }}
            />
          </div>

          {/* Month Filter Clear / Badge */}
          {selectedMonth && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Badge variant="indigo" size="md">
                Month: {MONTH_NAMES[selectedMonth - 1]}
              </Badge>
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className="text-xs text-fg-muted hover:text-fg-secondary underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Table with Toolbar & Filter Dropdowns */}
        <Table
          columns={columns}
          data={bounces}
          loading={isListLoading || isFetching}
          searchPlaceholder="Search by email, name, subject, or error code..."
          search={search}
          onSearchChange={setSearch}
          enableSearch={true}
          enablePagination={true}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          meta={meta}
          isError={isListError}
          error={listError}
          onRetry={() => refetchList()}
          resource="email bounces"
          emptyMessage="No bounce alerts found matching current criteria"
        >
          <ListToolbar
            actions={[
              { title: "Refresh", fn: handleRefreshAll },
              ...(canManage
                ? [
                    {
                      title: "Export CSV",
                      fn: () =>
                        downloadCsvExport(
                          "/email-bounces/export",
                          computedExportParams,
                          `email-bounces-${new Date().toISOString().slice(0, 10)}.csv`,
                        ),
                    },
                  ]
                : []),
            ]}
            trailing={
              <FiltersButton onClick={openPanel} activeCount={activeCount} />
            }
          />
        </Table>
      </div>

      <FiltersModal {...panelProps} />

      {/* Modal: View Diagnostics Details */}
      <ViewBounceDetailsModal
        isOpen={Boolean(selectedBounce)}
        bounce={selectedBounce}
        onClose={() => setSelectedBounce(null)}
        isResolving={resolveMutation.isPending}
        onRemediate={(bounce) => {
          setSelectedBounce(null);
          setRemediateTarget(bounce);
        }}
        onResolve={(bounce) => resolveMutation.mutate(bounce.id)}
      />

      {/* Modal: Remediate Bounced Email Address */}
      <RemediateBounceModal
        isOpen={Boolean(remediateTarget)}
        bounce={remediateTarget}
        onClose={() => setRemediateTarget(null)}
        onSuccess={invalidateBounces}
      />
    </div>
  );
}
