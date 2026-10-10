"use client";

import { useMemo } from "react";
import { MailWarning } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { EmailBounceTabFilter } from "@/models/emailBounce";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { YearSelect } from "../_components/YearSelect";
import { ReportStatusBar } from "../_components/ReportStatusBar";
import {
  BOUNCE_EXPORT_ENDPOINT,
  bounceExportFilename,
} from "./_components/bounceConfig";
import { useBouncesReport } from "./_components/useBouncesReport";
import { useBounceColumns } from "./_components/useBounceColumns";
import { BounceKpis } from "./_components/BounceKpis";
import { BounceInsights } from "./_components/BounceInsights";
import { BounceModals } from "./_components/BounceModals";

export default function EmailBouncesPage() {
  const report = useBouncesReport();
  const {
    canManage,
    currentYear,
    analytics,
    list,
    summary,
    filters,
    computedExportParams,
    refreshAll,
  } = report;
  const byBounceType = analytics.analytics?.byBounceType;

  const columns = useBounceColumns({
    canManage,
    onRemediate: report.setRemediateTarget,
    onResolve: report.setResolveTarget,
    onView: report.setSelectedBounce,
  });

  const tabs = useMemo(() => {
    const countFor = (category: string) =>
      byBounceType?.find((b) => b.category.toLowerCase() === category)?.count;
    return [
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
        count: countFor("hard"),
      },
      {
        id: EmailBounceTabFilter.SOFT_BOUNCE,
        label: "Soft Bounces",
        count: countFor("soft"),
      },
      {
        id: EmailBounceTabFilter.RESOLVED,
        label: "Resolved",
        count: summary.resolvedBounces,
      },
    ];
  }, [summary, byBounceType]);

  return (
    <div className="space-y-6 pb-10 min-w-0 max-w-full">
      <PageHeader
        title="Email Bounces & Delivery Issues"
        description="Monitor Resend webhooks, remediate invalid emails, and resend critical communications."
        icon={MailWarning}
        breadcrumbs={[{ label: "Reports" }, { label: "Email Bounces" }]}
        actions={
          <>
            <YearSelect
              value={report.selectedYear}
              years={[
                currentYear - 2,
                currentYear - 1,
                currentYear,
                currentYear + 1,
              ]}
              onChange={report.changeYear}
            />
            <RefreshButton onRefetch={refreshAll} />
            {canManage && (
              <ExportCsvButton
                endpoint={BOUNCE_EXPORT_ENDPOINT}
                params={computedExportParams}
                fallbackFilename={bounceExportFilename()}
                label="Export CSV"
              />
            )}
          </>
        }
      />

      <BounceKpis
        summary={summary}
        selectedYear={report.selectedYear}
        selectedMonth={report.selectedMonth}
        isLoading={analytics.isLoading}
        isError={analytics.isError}
        error={analytics.error}
        onRetry={() => analytics.refetch()}
      />

      <BounceInsights analytics={analytics.analytics} />

      <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-6 shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
        <ReportStatusBar
          tabs={tabs}
          activeTab={report.tabFilter}
          onTabChange={(id) => report.changeTab(id as EmailBounceTabFilter)}
          selectedMonth={report.selectedMonth}
          onClearMonth={() => report.setSelectedMonth(null)}
        />

        <Table
          columns={columns}
          data={list.bounces}
          loading={list.isLoading || list.isFetching}
          searchPlaceholder="Search by email, name, subject, or error code..."
          search={filters.search}
          onSearchChange={filters.setSearch}
          enableSearch={true}
          enablePagination={true}
          page={filters.page}
          onPageChange={filters.setPage}
          limit={filters.limit}
          onLimitChange={filters.setLimit}
          meta={report.meta}
          isError={list.isError}
          error={list.error}
          onRetry={() => list.refetch()}
          resource="email bounces"
          emptyMessage="No bounce alerts found matching current criteria"
        >
          <ListToolbar
            actions={[
              { title: "Refresh", fn: refreshAll },
              ...(canManage
                ? [
                    {
                      title: "Export CSV",
                      fn: () =>
                        downloadCsvExport(
                          BOUNCE_EXPORT_ENDPOINT,
                          computedExportParams,
                          bounceExportFilename(),
                        ),
                    },
                  ]
                : []),
            ]}
            trailing={
              <FiltersButton
                onClick={filters.openPanel}
                activeCount={filters.activeCount}
              />
            }
          />
        </Table>
      </div>

      <FiltersModal {...filters.panelProps} />

      <BounceModals
        selectedBounce={report.selectedBounce}
        setSelectedBounce={report.setSelectedBounce}
        resolveTarget={report.resolveTarget}
        setResolveTarget={report.setResolveTarget}
        remediateTarget={report.remediateTarget}
        setRemediateTarget={report.setRemediateTarget}
        resolve={report.resolveMutation.mutateAsync}
        isResolving={report.resolveMutation.isPending}
      />
    </div>
  );
}
