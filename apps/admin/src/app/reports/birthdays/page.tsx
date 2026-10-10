"use client";

import { useMemo } from "react";
import { Cake } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { SendBirthdayEmailModal } from "@/components/dashboard/SendBirthdayEmailModal";
import { ViewBirthdayGreetingModal } from "@/components/modals/ViewBirthdayGreetingModal";
import { BirthdayStatusFilter } from "@/models/birthday";
import { YearSelect } from "../_components/YearSelect";
import { ReportStatusBar } from "../_components/ReportStatusBar";
import { AnalyticsErrorCard } from "../_components/AnalyticsErrorCard";
import { useBirthdaysReport } from "./_components/useBirthdaysReport";
import { useBirthdayColumns } from "./_components/useBirthdayColumns";
import { BirthdayKpis } from "./_components/BirthdayKpis";
import { BirthdayMonthStrip } from "./_components/BirthdayMonthStrip";

export default function BirthdayReportsPage() {
  const report = useBirthdaysReport();
  const { currentYear, analytics, list, filters, refetchAll } = report;
  const analyticsData = analytics.analytics;

  const columns = useBirthdayColumns({
    showAge: report.isSuperAdmin,
    onView: report.setViewTarget,
    onSendEmail: report.setEmailTarget,
  });

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
            <YearSelect
              value={report.selectedYear}
              years={[currentYear - 1, currentYear, currentYear + 1]}
              onChange={report.changeYear}
            />
            <RefreshButton onRefetch={refetchAll} showText text="Refresh" />
          </>
        }
      />

      {analytics.isError ? (
        <AnalyticsErrorCard
          resource="birthday analytics"
          error={analytics.error}
          onRetry={() => analytics.refetch()}
        />
      ) : (
        <>
          <BirthdayKpis
            analytics={analyticsData}
            selectedYear={report.selectedYear}
            selectedMonth={report.selectedMonth}
            isLoading={analytics.isLoading}
          />
          <BirthdayMonthStrip
            monthlyBreakdown={analyticsData?.monthlyBreakdown}
            selectedYear={report.selectedYear}
            selectedMonth={report.selectedMonth}
            onSelectMonth={report.setMonthFilter}
          />
        </>
      )}

      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
        <ReportStatusBar
          tabs={statusTabs}
          activeTab={report.statusFilter}
          onTabChange={(id) => report.changeStatus(id as BirthdayStatusFilter)}
          selectedMonth={report.selectedMonth}
          onClearMonth={() => report.setMonthFilter(null)}
        />

        <Table
          columns={columns}
          data={list.birthdays}
          searchPlaceholder="Search member by name, email, or phone..."
          search={filters.search}
          onSearchChange={filters.setSearch}
          enableSearch={true}
          enablePagination={true}
          page={filters.page}
          onPageChange={filters.setPage}
          limit={filters.limit}
          onLimitChange={filters.setLimit}
          meta={list.meta}
          loading={list.isLoading}
          isError={list.isError}
          error={list.error}
          onRetry={() => list.refetch()}
          resource="birthdays"
          emptyMessage="No birthday records found for the selected cycle and filters."
        >
          <ListToolbar actions={[{ title: "Refresh", fn: refetchAll }]} />
        </Table>
      </div>

      <SendBirthdayEmailModal
        birthday={report.emailTarget}
        isOpen={Boolean(report.emailTarget)}
        onClose={() => report.setEmailTarget(null)}
        onSuccess={refetchAll}
      />

      <ViewBirthdayGreetingModal
        person={report.viewTarget}
        isOpen={Boolean(report.viewTarget)}
        onClose={() => report.setViewTarget(null)}
        onSendGreeting={(person) => report.setEmailTarget(person)}
      />
    </div>
  );
}
