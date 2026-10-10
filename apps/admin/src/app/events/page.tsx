"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  CalendarPlus,
  Radio,
  Users,
  Ticket,
  DoorOpen,
  Star,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Table } from "@/components/ui/Table";
import {
  EmptyState,
  QueryState,
  SkeletonCardGrid,
} from "@/components/ui/QueryState";
import { cn } from "@/helpers/cn";
import { ActionsList, type ActionItem } from "@/components/ui/ActionsList";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useDashboard } from "@/context/DashboardContext";
import { useEvents } from "@/hooks/useEvents";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import {
  adaptApiEventToChurchEvent,
  EventCategory,
  getCategoryColor,
} from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES } from "@/utils/rbac";
import { EventCard } from "./_components/EventCard";

// Rendered inline in the toolbar rather than in the filters panel.
const eventSelectFields = [
  {
    type: "select",
    key: "status",
    label: "Status",
    allLabel: "All Statuses",
    options: [
      { label: "Published", value: "PUBLISHED" },
      { label: "Draft", value: "DRAFT" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    type: "select",
    key: "category",
    label: "Category",
    allLabel: "All Categories",
    options: [
      "GENERAL",
      "CONFERENCE",
      "VIGIL",
      "COMMUNION",
      "REVIVAL",
      "WORSHIP",
      "OUTREACH",
    ].map((c) => ({ label: c, value: c })),
  },
  {
    type: "boolean",
    key: "requiresRegistration",
    label: "Admission Type",
    allLabel: "All Admission Types",
    trueLabel: "Registration Required",
    falseLabel: "Open Admission",
  },
] satisfies FilterField[];

const eventFilterFields: FilterField[] = [
  ...eventSelectFields,
  {
    type: "boolean",
    key: "isFeatured",
    label: "Featured",
    trueLabel: "Featured On Website",
    falseLabel: "Standard",
  },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const chipBase =
  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer";

export default function EventsPage() {
  const router = useRouter();
  const { setIsCreateEventOpen } = useDashboard();

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
    queryParams,
  } = useListFilters({ fields: eventFilterFields, searchDebounceMs: 400 });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals State
  const [editingEvent, setEditingEvent] = useState<IChurchEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<IChurchEvent | null>(null);

  const {
    events: apiEvents,
    meta,
    refetch,
    updateEvent,
    deleteEvent,
    isLoading,
    isError,
    error,
  } = useEvents(queryParams);

  const events = useMemo(
    () =>
      Array.isArray(apiEvents) ? apiEvents.map(adaptApiEventToChurchEvent) : [],
    [apiEvents],
  );

  // Metrics summary
  const totalEvents = meta?.total ?? events.length;
  // No aggregate endpoint yet: these breakdowns only cover the loaded page.
  const statsArePartial = totalEvents > events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const ticketedEvents = events.filter((e) => e.requiresRegistration).length;
  const openServices = events.filter((e) => !e.requiresRegistration).length;
  const totalRegistrations = events.reduce(
    (sum, e) => sum + e.registeredCount,
    0,
  );

  const hasActiveFilters = Boolean(search) || activeCount > 0;
  const resetFilters = useCallback(() => {
    setSearch("");
    clearFilters();
  }, [setSearch, clearFilters]);

  const getEventActions = useCallback(
    (evt: IChurchEvent): ActionItem[] => [
      {
        title: "View Event Details",
        fn: () => router.push(`/events/${evt.id}`),
      },
      {
        title: "Edit Event",
        fn: () => setEditingEvent(evt),
      },
      ...(evt.requiresRegistration
        ? [
            {
              title: "View Teams & Roster",
              fn: () => router.push(`/events/${evt.id}?tab=teams`),
            },
          ]
        : []),
      {
        title: evt.status === "DRAFT" ? "Publish Event" : "Unpublish to Draft",
        fn: async () => {
          await updateEvent({
            id: evt.id,
            dto: {
              status: evt.status === "DRAFT" ? "PUBLISHED" : "DRAFT",
            },
          });
        },
      },
      {
        title: "Delete Event",
        fn: () => setDeletingEvent(evt),
        destructive: true,
      },
    ],
    [router, updateEvent],
  );

  const columns = useMemo<ColumnDef<IChurchEvent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Title & Badges",
        cell: ({ row }) => {
          const evt = row.original;
          return (
            <div className="flex items-center gap-3">
              {evt.imageUrl && (
                <div
                  onClick={() => router.push(`/events/${evt.id}`)}
                  className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0 border border-border-control cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.imageUrl}
                    alt={evt.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="font-bold text-fg hover:text-primary-text cursor-pointer transition-colors"
                  >
                    {evt.name}
                  </span>
                  {evt.isFeatured && (
                    <Badge
                      color="gold"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      FEATURED
                    </Badge>
                  )}
                </div>
                {evt.description && (
                  <p className="text-2xs text-fg-subtle line-clamp-1 max-w-xs">
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            <Badge color={getCategoryColor(row.original.category)} size="sm">
              {row.original.category}
            </Badge>
          </span>
        ),
      },
      {
        accessorKey: "requiresRegistration",
        header: "Admission Type",
        cell: ({ row }) =>
          row.original.requiresRegistration ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-text whitespace-nowrap">
              <Ticket className="w-3.5 h-3.5 text-primary" />
              Registration Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-text whitespace-nowrap">
              <DoorOpen className="w-3.5 h-3.5 text-success" />
              Open Admission
            </span>
          ),
      },
      {
        accessorKey: "registeredCount",
        header: "Capacity / Attendance",
        cell: ({ row }) => {
          const evt = row.original;
          if (!evt.requiresRegistration) {
            return (
              <span className="text-xs font-medium text-fg-subtle whitespace-nowrap">
                Open Admission
              </span>
            );
          }
          return (
            <div className="space-y-1 whitespace-nowrap">
              <span className="font-mono text-xs font-semibold text-fg">
                {evt.registeredCount}/
                {evt.capacity !== null && evt.capacity !== undefined
                  ? evt.capacity
                  : "∞"}
              </span>
              {evt.capacity ? (
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((evt.registeredCount / evt.capacity) * 100),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              ) : (
                <p className="text-2xs text-fg-subtle">Unlimited seats</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: "Schedule & Location",
        cell: ({ row }) => (
          <div className="space-y-0.5 text-fg-secondary">
            <p className="font-medium truncate max-w-[180px]">
              {row.original.location || "Sanctuary"}
            </p>
            <p className="text-2xs text-fg-subtle flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(row.original.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} size="sm" />
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <ActionsList actions={getEventActions(row.original)} />
          </div>
        ),
      },
    ],
    [router, getEventActions],
  );

  const createEventButton = (
    <AuthorityGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR]}>
      <Button
        size="sm"
        className="h-9"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => setIsCreateEventOpen(true)}
      >
        Create Event
      </Button>
    </AuthorityGuard>
  );

  const emptyState = (
    <EmptyState
      icon={Calendar}
      title="No events found"
      description={
        hasActiveFilters
          ? "Try adjusting your search criteria or clear the filters."
          : "Create your first event to get started."
      }
      action={
        hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        ) : (
          <AuthorityGuard
            roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR]}
          >
            <Button
              size="sm"
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => setIsCreateEventOpen(true)}
            >
              Create event
            </Button>
          </AuthorityGuard>
        )
      }
    />
  );

  const viewToggleClass = (active: boolean) =>
    cn(
      "h-7.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
      active
        ? "bg-surface text-primary-text shadow-xs"
        : "text-fg-muted hover:text-fg",
    );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Event Management"
        description="Organize conferences, worship vigils, open ministry programs, and ticketed summits."
        actions={
          <>
            {/* View Mode Toggle */}
            <div
              role="group"
              aria-label="View mode"
              className="flex h-9 items-center p-0.5 rounded-xl bg-muted border border-border-control shadow-xs"
            >
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={viewToggleClass(viewMode === "table")}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={viewToggleClass(viewMode === "grid")}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cards</span>
              </button>
            </div>

            <RefreshButton onRefetch={refetch} />
            {createEventButton}
          </>
        }
      />

      {/* Metrics Cards */}
      <StatsCardGroup>
        <StatsCard
          title="Total Events"
          value={totalEvents.toLocaleString()}
          change="All platform events"
          trend="neutral"
          icon={Calendar}
          color="indigo"
          loading={isLoading}
        />
        <StatsCard
          title="Published Events"
          value={publishedEvents.toLocaleString()}
          change="Live & visible"
          trend="up"
          icon={Radio}
          color="emerald"
          description={statsArePartial ? "Current page only" : undefined}
          loading={isLoading}
        />
        <StatsCard
          title="Ticketed Events"
          value={ticketedEvents.toLocaleString()}
          change="Registration required"
          trend="neutral"
          icon={Ticket}
          color="cyan"
          description={statsArePartial ? "Current page only" : undefined}
          loading={isLoading}
        />
        <StatsCard
          title="Open Admission"
          value={openServices.toLocaleString()}
          change="Open church services"
          trend="neutral"
          icon={DoorOpen}
          color="amber"
          description={statsArePartial ? "Current page only" : undefined}
          loading={isLoading}
        />
        <StatsCard
          title="Total Registered"
          value={totalRegistrations.toLocaleString()}
          change="Confirmed attendees"
          trend="up"
          icon={Users}
          color="indigo"
          description={statsArePartial ? "Current page only" : undefined}
          loading={isLoading}
        />
      </StatsCardGroup>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 bg-surface p-4 rounded-2xl border border-border shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {eventSelectFields.map((field, idx) => (
            <div key={field.key}>
              <Select
                aria-label={field.label}
                value={filters[field.key] ?? ""}
                onChange={(e) => setFilter(field.key, e.target.value)}
                leftIcon={
                  idx === 0 ? <Filter className="w-4 h-4" /> : undefined
                }
              >
                <option value="">{field.allLabel}</option>
                {field.type === "boolean" ? (
                  <>
                    <option value="true">{field.trueLabel}</option>
                    <option value="false">{field.falseLabel}</option>
                  </>
                ) : (
                  field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                )}
              </Select>
            </div>
          ))}
        </div>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-semibold text-fg-subtle">
              Quick Filter:
            </span>
            <button
              type="button"
              aria-pressed={!filters.isFeatured}
              onClick={() => setFilter("isFeatured", "")}
              className={cn(
                chipBase,
                !filters.isFeatured
                  ? "bg-fg text-surface shadow-xs"
                  : "bg-muted text-fg-secondary hover:bg-muted-strong",
              )}
            >
              All Events
            </button>
            <button
              type="button"
              aria-pressed={filters.isFeatured === "true"}
              onClick={() => setFilter("isFeatured", "true")}
              className={cn(
                chipBase,
                filters.isFeatured === "true"
                  ? "bg-warning text-white shadow-xs"
                  : "bg-warning-soft text-warning-text",
              )}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Featured On Website
            </button>
            <button
              type="button"
              aria-pressed={filters.requiresRegistration === "false"}
              onClick={() => setFilter("requiresRegistration", "false")}
              className={cn(
                chipBase,
                filters.requiresRegistration === "false"
                  ? "bg-success text-white shadow-xs"
                  : "bg-success-soft text-success-text",
              )}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              Open Admission
            </button>
            <button
              type="button"
              aria-pressed={filters.requiresRegistration === "true"}
              onClick={() => setFilter("requiresRegistration", "true")}
              className={cn(
                chipBase,
                filters.requiresRegistration === "true"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-primary-soft text-primary-text",
              )}
            >
              <Ticket className="w-3.5 h-3.5" />
              Registration Required
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-text"
              onClick={resetFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      {/* Content: Table View vs Grid View */}
      {viewMode === "table" ? (
        <Table
          columns={columns}
          data={events}
          enableSearch={false}
          meta={meta}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          loading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          resource="events"
          emptyState={emptyState}
        />
      ) : (
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          isEmpty={events.length === 0}
          loading={
            <SkeletonCardGrid
              count={Math.min(limit, 6)}
              className="md:grid-cols-2 xl:grid-cols-2"
            />
          }
          empty={
            <div className="rounded-2xl border border-border bg-surface">
              {emptyState}
            </div>
          }
          resource="events"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  actions={getEventActions(evt)}
                  onOpen={(path) => router.push(path)}
                />
              ))}
            </div>
            <Pagination
              className="p-3.5 border border-border bg-surface rounded-2xl shadow-xs"
              page={page}
              totalPages={meta?.totalPages ?? 1}
              totalItems={meta?.total ?? events.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </QueryState>
      )}

      {/* Edit Event Sidebar Modal */}
      {editingEvent && (
        <SidebarModal
          title="Edit Event"
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
        >
          <EventsForm
            initialValues={{
              id: editingEvent.id,
              title: editingEvent.name,
              category: editingEvent.category as EventCategory,
              description: editingEvent.description,
              location: editingEvent.location,
              capacity: editingEvent.capacity,
              startDate: editingEvent.startDate,
              endDate: editingEvent.endDate,
              status: editingEvent.status,
              imageUrl: editingEvent.imageUrl || undefined,
              googleCalendarSync: editingEvent.googleCalendarSync,
              requiresRegistration: editingEvent.requiresRegistration,
              highlights: editingEvent.highlights || undefined,
              isFeatured: editingEvent.isFeatured,
            }}
            onCancel={() => setEditingEvent(null)}
            onSubmit={async (data) => {
              await updateEvent({
                id: editingEvent.id,
                dto: data,
              });
              setEditingEvent(null);
            }}
            onDelete={async () => {
              await deleteEvent(editingEvent.id);
              setEditingEvent(null);
            }}
          />
        </SidebarModal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <ConfirmActionModal
          display={Boolean(deletingEvent)}
          close={() => setDeletingEvent(null)}
          actionName="delete"
          title={`Are you sure you want to delete ${deletingEvent.name}?`}
          fn={async () => {
            await deleteEvent(deletingEvent.id);
            setDeletingEvent(null);
          }}
        />
      )}
    </div>
  );
}
