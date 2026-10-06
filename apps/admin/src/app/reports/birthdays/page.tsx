"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { birthdayService } from "@/services/birthday.service";
import { BirthdayPersonItem, BirthdayStatusFilter } from "@/models/birthday";
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
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal State (Selected person drives modal open/close)
  const [emailTarget, setEmailTarget] = useState<BirthdayPersonItem | null>(
    null,
  );
  const [viewTarget, setViewTarget] = useState<BirthdayPersonItem | null>(null);

  const setMonthFilter = (month: number | null) => {
    setSelectedMonth(month);
    setPage(1);
  };

  // 1. Fetch Birthday Analytics
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["birthday-analytics", selectedYear, selectedMonth],
    queryFn: () =>
      birthdayService.getBirthdayAnalytics({
        year: selectedYear,
        month: selectedMonth || undefined,
      }),
  });

  // 2. Fetch Paginated Birthdays List
  const {
    data: listData,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: [
      "birthdays-list",
      selectedYear,
      selectedMonth,
      statusFilter,
      search,
      page,
      limit,
    ],
    queryFn: () =>
      birthdayService.getBirthdays({
        year: selectedYear,
        month: selectedMonth || undefined,
        status:
          statusFilter === BirthdayStatusFilter.ALL ? undefined : statusFilter,
        search: search.trim() || undefined,
        page,
        limit,
      }),
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
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-zinc-700">
                  {initials || <Cake className="w-4 h-4" />}
                </div>
                <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {fullName}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {person.email ? (
                      <TruncatedTextWithCopy
                        text={person.email}
                        maxLength={22}
                        textClassName="text-[11px] text-slate-500 dark:text-slate-400"
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
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {target ? dayjs(target).format("MMM D") : "—"}
              </p>
              {person.turningAge !== undefined &&
                person.turningAge !== null && (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs shadow-indigo-500/20 animate-pulse whitespace-nowrap">
                🎉 Today!
              </span>
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
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full w-fit">
                  <CheckCircle2 className="w-3 h-3" /> Greeted
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  By {senderName}
                </span>
              </div>
            );
          }

          if (person.status === "MISSED") {
            return (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full w-fit whitespace-nowrap">
                <AlertCircle className="w-3 h-3" /> Missed
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full w-fit whitespace-nowrap">
              <Clock className="w-3 h-3" /> Pending
            </span>
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
  }, []);

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
    <div className="space-y-5 sm:space-y-6 pb-12 min-w-0 max-w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs shrink-0">
              <Cake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                Birthday Outreach & Analytics
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Monitor member birthdays, track outreach coverage, and send
                blessings.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Year Selector & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none focus:outline-hidden cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <RefreshButton onRefetch={handleRefetchAll} showText text="Refresh" />
        </div>
      </div>

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
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0 max-w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              12-Month Outreach Distribution ({selectedYear})
            </h3>
          </div>
          {selectedMonth !== null && (
            <button
              type="button"
              onClick={() => setMonthFilter(null)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Show Full Year
            </button>
          )}
        </div>

        {/* Responsive Month Grid */}
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2 min-w-[320px]">
            {monthlyStats.map(({ monthNum, abbr, total, completed, rate }) => {
              const isSelected = selectedMonth === monthNum;

              return (
                <button
                  key={abbr}
                  type="button"
                  onClick={() => setMonthFilter(isSelected ? null : monthNum)}
                  className={clsx(
                    "flex flex-col items-start p-2 sm:p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40",
                  )}
                >
                  <div className="w-full flex items-center justify-between mb-1">
                    <span
                      className={clsx(
                        "text-xs font-bold",
                        isSelected
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-slate-800 dark:text-slate-200",
                      )}
                    >
                      {abbr}
                    </span>
                    {total > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {completed}/{total}
                      </span>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {total} {total === 1 ? "b'day" : "b'days"}
                    </div>
                    {total > 0 ? (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, rate)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                          {rate.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">
                        None
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Birthday Directory Table Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
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
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Data Table with ListToolbar and ActionsList */}
        <Table
          columns={columns}
          data={listData?.data || []}
          searchPlaceholder="Search member by name, email, or phone..."
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          enableSearch={true}
          enablePagination={true}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          meta={{
            total: listData?.total ?? 0,
            page: listData?.page ?? 1,
            limit: listData?.limit ?? limit,
            totalPages: listData?.totalPages ?? 1,
          }}
          loading={isListLoading}
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
