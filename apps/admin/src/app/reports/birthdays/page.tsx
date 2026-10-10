"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Cake,
  MailCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Percent,
  Users,
  Calendar,
  Sparkles,
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
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { SendBirthdayEmailModal } from "@/components/dashboard/SendBirthdayEmailModal";
import { ViewBirthdayGreetingModal } from "@/components/modals/ViewBirthdayGreetingModal";
import { BirthdayPersonItem, BirthdayStatusFilter } from "@/models/birthday";
import { useAuth } from "@/hooks/useAuth";
import { useListFilters } from "@/hooks/useListFilters";
import { useBirthdayAnalytics, useBirthdays } from "@/hooks/useBirthdays";
import { getUserRoles, ROLES } from "@/utils/rbac";
import { clsx } from "clsx";
import dayjs from "dayjs";

const columnHelper = createColumnHelper<BirthdayPersonItem>();

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

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function BirthdayReportsPage() {
  const { user } = useAuth();
  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Filters State
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );
  const [statusFilter, setStatusFilter] = useState<BirthdayStatusFilter>(
    BirthdayStatusFilter.ALL,
  );
  // Pagination + table search. Year, month and status stay page state: they
  // drive the analytics cards too, not just the list.
  const { page, setPage, limit, setLimit, search, setSearch } = useListFilters(
    {},
  );

  // Modal State (Selected person drives modal open/close)
  const [emailTarget, setEmailTarget] = useState<BirthdayPersonItem | null>(
    null,
  );
  const [viewTarget, setViewTarget] = useState<BirthdayPersonItem | null>(null);

  const setMonthFilter = (month: number | null) => {
    setSelectedMonth(month);
    setPage(1);
  };

  // 1. Birthday Analytics
  const {
    analytics: analyticsData,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useBirthdayAnalytics({ year: selectedYear, month: selectedMonth });

  // 2. Paginated Birthdays List
  const {
    birthdays,
    meta: listMeta,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useBirthdays({
    year: selectedYear,
    month: selectedMonth,
    status: statusFilter,
    search,
    page,
    limit,
  });

  const handleRefetchAll = () =>
    Promise.all([refetchAnalytics(), refetchList()]);

  // Table Columns Definition
  const columns = useMemo<ColumnDef<BirthdayPersonItem>[]>(() => {
    return [
      columnHelper.accessor(
        (row) => `${row.firstName} ${row.lastName}`.trim(),
        {
          id: "member",
          header: "Member",
          cell: ({ row }) => {
            const person = row.original;
            const fullName =
              [person.firstName, person.lastName].filter(Boolean).join(" ") ||
              "Member";
            const initials =
              `${person.firstName?.[0] || ""}${person.lastName?.[0] || ""}`.toUpperCase();

            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-soft text-primary-text font-bold text-xs flex items-center justify-center shrink-0 border border-primary-border">
                  {initials || <Cake className="w-4 h-4" />}
                </div>
                <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                  <p className="text-xs font-bold text-fg truncate">
                    {fullName}
                  </p>
                  <div className="text-2xs text-fg-muted truncate">
                    {person.email ? (
                      <TruncatedTextWithCopy
                        text={person.email}
                        maxLength={22}
                        textClassName="text-2xs text-fg-muted"
                      />
                    ) : person.phone ? (
                      <span>{person.phone}</span>
                    ) : (
                      <NotAvailable />
                    )}
                  </div>
                </div>
              </div>
            );
          },
        },
      ),

      columnHelper.accessor("membershipStatus", {
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={String(getValue() || "MEMBER")} size="sm" />
        ),
      }),

      columnHelper.accessor("birthdayDate", {
        header: "Birthday",
        cell: ({ row }) => {
          const person = row.original;
          const target = person.birthdayDate || person.dateOfBirth;
          return (
            <div className="space-y-0.5 whitespace-nowrap">
              <p className="text-xs font-semibold text-fg">
                {target ? dayjs(target).format("MMM D") : "—"}
              </p>
              {isSuperAdmin &&
                person.turningAge !== undefined &&
                person.turningAge !== null && (
                  <span className="text-2xs font-medium text-fg-muted">
                    Turning {person.turningAge}
                  </span>
                )}
            </div>
          );
        },
      }),

      columnHelper.accessor("daysUntil", {
        header: "Due",
        cell: ({ getValue }) => {
          const days = Number(getValue());
          if (days === 0) {
            return (
              <Badge
                variant="indigo"
                size="sm"
                className="font-bold whitespace-nowrap animate-pulse"
              >
                🎉 Today!
              </Badge>
            );
          }
          if (days === 1) {
            return (
              <Badge
                variant="amber"
                size="sm"
                className="font-semibold whitespace-nowrap"
              >
                Tomorrow
              </Badge>
            );
          }
          if (days > 1) {
            return (
              <Badge variant="slate" size="sm" className="whitespace-nowrap">
                In {days} days
              </Badge>
            );
          }
          return (
            <Badge variant="rose" size="sm" className="whitespace-nowrap">
              {Math.abs(days)}d ago
            </Badge>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Outreach Status",
        cell: ({ row }) => {
          const person = row.original;
          if (person.isGreeted || person.status === "COMPLETED") {
            const senderName =
              [
                person.greeting?.sentBy?.firstName,
                person.greeting?.sentBy?.lastName,
              ]
                .filter(Boolean)
                .join(" ") || "Admin";

            return (
              <div className="flex flex-col gap-0.5 whitespace-nowrap">
                <Badge
                  variant="emerald"
                  size="sm"
                  className="font-semibold w-fit"
                >
                  <CheckCircle2 className="w-3 h-3" /> Greeted
                </Badge>
                <span className="text-2xs text-fg-muted truncate max-w-[140px]">
                  By {senderName}
                </span>
              </div>
            );
          }

          if (person.status === "MISSED") {
            return (
              <Badge
                variant="rose"
                size="sm"
                className="font-semibold w-fit whitespace-nowrap"
              >
                <AlertCircle className="w-3 h-3" /> Missed
              </Badge>
            );
          }

          return (
            <Badge
              variant="amber"
              size="sm"
              className="font-semibold w-fit whitespace-nowrap"
            >
              <Clock className="w-3 h-3" /> Pending
            </Badge>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const person = row.original;
          const isGreeted = person.isGreeted || person.status === "COMPLETED";

          const actions: ActionItem[] = isGreeted
            ? [
                { title: "View Record", fn: () => setViewTarget(person) },
                ...(person.email
                  ? [
                      {
                        title: "Send Another Message",
                        fn: () => setEmailTarget(person),
                      },
                    ]
                  : []),
              ]
            : [
                {
                  title: "Send Birthday Message",
                  disabled: !person.email,
                  fn: () => setEmailTarget(person),
                },
              ];

          return (
            <div className="flex justify-end">
              <ActionsList actions={actions} />
            </div>
          );
        },
      }),
    ] as ColumnDef<BirthdayPersonItem>[];
  }, [isSuperAdmin]);

  // 12-Month Distribution Summary Data
  const monthlyStats = useMemo(() => {
    const map = new Map(
      analyticsData?.monthlyBreakdown?.map((m) => [m.month, m]),
    );
    return MONTH_ABBR.map((abbr, idx) => {
      const monthNum = idx + 1;
      const stat = map.get(monthNum);
      return {
        monthNum,
        abbr,
        total: stat?.total ?? 0,
        completed: stat?.completed ?? 0,
        rate: stat?.handlingRate ?? 0,
      };
    });
  }, [analyticsData?.monthlyBreakdown]);

  // KPI Stats Cards Configuration
  const kpiStats = useMemo(
    () => [
      {
        title: "Handling Rate",
        value: `${analyticsData?.handlingRate ?? 0}%`,
        description: selectedMonth
          ? `${MONTH_NAMES[selectedMonth - 1]} coverage`
          : `${selectedYear} overall`,
        icon: Percent,
        color: "emerald" as const,
      },
      {
        title: "Total Birthdays",
        value: analyticsData?.totalBirthdays ?? 0,
        description: "Members in cycle",
        icon: Users,
        color: "indigo" as const,
      },
      {
        title: "Greeted",
        value: analyticsData?.completedCount ?? 0,
        description: "Delivered",
        icon: MailCheck,
        color: "cyan" as const,
      },
      {
        title: "Pending",
        value: analyticsData?.pendingCount ?? 0,
        description: "Upcoming",
        icon: Clock,
        color: "amber" as const,
      },
      {
        title: "Missed",
        value: analyticsData?.missedCount ?? 0,
        description: "Ungreeted past",
        icon: AlertCircle,
        color: "rose" as const,
        className: "col-span-2 sm:col-span-1",
      },
    ],
    [analyticsData, selectedMonth, selectedYear],
  );

  // Filter Tabs Configuration
  const statusTabs = useMemo(
    () => [
      {
        id: BirthdayStatusFilter.ALL,
        label: "All Birthdays",
        count: analyticsData?.totalBirthdays,
      },
      {
        id: BirthdayStatusFilter.PENDING,
        label: "Pending",
        count: analyticsData?.pendingCount,
      },
      {
        id: BirthdayStatusFilter.COMPLETED,
        label: "Greeted",
        count: analyticsData?.completedCount,
      },
      {
        id: BirthdayStatusFilter.MISSED,
        label: "Missed",
        count: analyticsData?.missedCount,
      },
    ],
    [analyticsData],
  );

  return (
    <div className="space-y-6 pb-10 min-w-0 max-w-full">
      <PageHeader
        title="Birthday Outreach & Analytics"
        description="Monitor member birthdays, track outreach coverage, and send blessings."
        icon={Cake}
        breadcrumbs={[{ label: "Reports" }, { label: "Birthdays" }]}
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
                className="text-base sm:text-xs font-semibold text-fg bg-transparent border-none focus:outline-hidden cursor-pointer"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <RefreshButton
              onRefetch={handleRefetchAll}
              showText
              text="Refresh"
            />
          </>
        }
      />

      {isAnalyticsError ? (
        <div className="rounded-2xl border border-border bg-surface shadow-xs">
          <ErrorState
            resource="birthday analytics"
            error={analyticsError}
            onRetry={() => refetchAnalytics()}
          />
        </div>
      ) : (
        <>
          {/* Analytics KPI Summary Cards */}
          <div className="w-full">
            <StatsCardGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full">
              {kpiStats.map((stat) => (
                <StatsCard
                  key={stat.title}
                  {...stat}
                  loading={isAnalyticsLoading}
                />
              ))}
            </StatsCardGroup>
          </div>

          {/* 12-Month Coverage Breakdown Strip */}
          <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0 max-w-full">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-text" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-fg-secondary">
                  12-Month Outreach Distribution ({selectedYear})
                </h3>
              </div>
              {selectedMonth !== null && (
                <button
                  type="button"
                  onClick={() => setMonthFilter(null)}
                  className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  Show Full Year
                </button>
              )}
            </div>

            {/* Responsive Month Grid */}
            <div className="overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2 min-w-[320px]">
                {monthlyStats.map(
                  ({ monthNum, abbr, total, completed, rate }) => {
                    const isSelected = selectedMonth === monthNum;

                    return (
                      <button
                        key={abbr}
                        type="button"
                        onClick={() =>
                          setMonthFilter(isSelected ? null : monthNum)
                        }
                        className={clsx(
                          "flex flex-col items-start p-2 sm:p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                          isSelected
                            ? "border-primary bg-primary-soft shadow-xs ring-2 ring-primary/20"
                            : "border-border hover:border-border-control bg-subtle",
                        )}
                      >
                        <div className="w-full flex items-center justify-between mb-1">
                          <span
                            className={clsx(
                              "text-xs font-bold",
                              isSelected ? "text-primary-text" : "text-fg",
                            )}
                          >
                            {abbr}
                          </span>
                          {total > 0 && (
                            <span className="text-2xs font-mono text-fg-muted">
                              {completed}/{total}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <div className="text-2xs font-semibold text-fg-secondary truncate">
                            {total} {total === 1 ? "b'day" : "b'days"}
                          </div>
                          {total > 0 ? (
                            <div className="mt-1 flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-muted-strong rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-success rounded-full transition-all"
                                  style={{ width: `${Math.min(100, rate)}%` }}
                                />
                              </div>
                              <span className="text-2xs font-mono text-success-text">
                                {rate.toFixed(0)}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xs text-fg-subtle">
                              None
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Member Birthday Directory Table Section */}
      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <div className="overflow-x-auto no-scrollbar max-w-full">
            <Tabs
              tabs={statusTabs}
              activeTab={statusFilter}
              onChange={(tabId) => {
                setStatusFilter(tabId as BirthdayStatusFilter);
                setPage(1);
              }}
            />
          </div>

          {selectedMonth && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Badge variant="indigo" size="md">
                Month: {MONTH_NAMES[selectedMonth - 1]}
              </Badge>
              <button
                type="button"
                onClick={() => setMonthFilter(null)}
                className="text-xs text-fg-muted hover:text-fg-secondary underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Data Table with ListToolbar and ActionsList */}
        <Table
          columns={columns}
          data={birthdays}
          searchPlaceholder="Search member by name, email, or phone..."
          search={search}
          onSearchChange={setSearch}
          enableSearch={true}
          enablePagination={true}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          meta={listMeta}
          loading={isListLoading}
          isError={isListError}
          error={listError}
          onRetry={() => refetchList()}
          resource="birthdays"
          emptyMessage="No birthday records found for the selected cycle and filters."
        >
          <ListToolbar actions={[{ title: "Refresh", fn: handleRefetchAll }]} />
        </Table>
      </div>

      {/* Compose Birthday Greeting Modal */}
      <SendBirthdayEmailModal
        birthday={emailTarget}
        isOpen={Boolean(emailTarget)}
        onClose={() => setEmailTarget(null)}
        onSuccess={handleRefetchAll}
      />

      {/* View Sent Greeting Audit Modal */}
      <ViewBirthdayGreetingModal
        person={viewTarget}
        isOpen={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        onSendGreeting={(person) => setEmailTarget(person)}
      />
    </div>
  );
}
