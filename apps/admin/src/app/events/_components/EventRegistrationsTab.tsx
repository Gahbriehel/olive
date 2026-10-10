import { ClipboardList, Filter, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { Pagination } from "@/components/ui/Pagination";
import {
  EmptyState,
  QueryState,
  SkeletonList,
} from "@/components/ui/QueryState";
import { regStatusField, type EventDetailData } from "./useEventDetailData";

const REG_PAGE_SIZES = [10, 25, 50, 100];

interface EventRegistrationsTabProps {
  data: EventDetailData["registrations"];
  /** Shown when the paginated meta has no total yet. */
  fallbackTotal: number;
}

export function EventRegistrationsTab({
  data,
  fallbackTotal,
}: EventRegistrationsTabProps) {
  const { list, registrations, meta, isLoading, isError, error, refetch } =
    data;
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    activeCount,
  } = list;
  const hasRegFilters = Boolean(search) || activeCount > 0;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle>Event Registrations</CardTitle>
          <CardDescription>
            Full list of confirmed attendees with server-side pagination
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-fg-secondary">
            Total: {meta?.total ?? fallbackTotal}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by attendee name, email, or registration #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div>
            <Select
              aria-label={regStatusField.label}
              value={filters.status ?? ""}
              onChange={(e) => setFilter("status", e.target.value)}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              <option value="">{regStatusField.allLabel}</option>
              {regStatusField.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          resource="registrations"
          isEmpty={registrations.length === 0}
          loading={<SkeletonList rows={Math.min(limit, 6)} />}
          empty={
            <EmptyState
              icon={ClipboardList}
              title={
                hasRegFilters
                  ? "No registrations found matching your criteria."
                  : "No registrations yet."
              }
              action={
                hasRegFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      clearFilters();
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          }
        >
          <div className="divide-y divide-border-subtle">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-text font-bold flex items-center justify-center text-xs shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-fg">{r.name}</p>
                      <StatusBadge status={r.membershipStatus} size="sm" />
                    </div>
                    <p className="text-2xs text-fg-subtle">
                      {r.email} • {r.phone} • Reg #{r.registrationNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {r.team?.name && (
                    <TeamBadge color={r.team.colorHex}>{r.team.name}</TeamBadge>
                  )}
                  <StatusBadge status={r.status} size="sm" />
                </div>
              </div>
            ))}
          </div>

          <Pagination
            className="pt-3 border-t border-border-subtle"
            page={page}
            totalPages={meta?.totalPages ?? 1}
            totalItems={meta?.total ?? registrations.length}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            pageSizeOptions={REG_PAGE_SIZES}
          />
        </QueryState>
      </CardContent>
    </Card>
  );
}
