"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, CalendarPlus } from "lucide-react";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Table } from "@/components/ui/Table";
import {
  EmptyState,
  QueryState,
  SkeletonCardGrid,
} from "@/components/ui/QueryState";
import { type ActionItem } from "@/components/ui/ActionsList";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useDashboard } from "@/context/DashboardContext";
import { useEvents } from "@/hooks/useEvents";
import { useListFilters } from "@/hooks/useListFilters";
import { adaptApiEventToChurchEvent } from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES } from "@/utils/rbac";
import { EventCard } from "./_components/EventCard";
import { EditEventPanel } from "./_components/EditEventPanel";
import { EventsFilterBar } from "./_components/EventsFilterBar";
import { EventsStats } from "./_components/EventsStats";
import {
  EVENT_PAGE_SIZE_OPTIONS,
  eventFilterFields,
} from "./_components/eventFilters";
import { useEventColumns } from "./_components/useEventColumns";
import {
  ViewModeToggle,
  type EventsViewMode,
} from "./_components/ViewModeToggle";

const EVENT_MANAGER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR];

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
  const [viewMode, setViewMode] = useState<EventsViewMode>("table");

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

  const columns = useEventColumns(getEventActions);

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
          <AuthorityGuard roles={EVENT_MANAGER_ROLES}>
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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Event Management"
        description="Organize conferences, worship vigils, open ministry programs, and ticketed summits."
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <RefreshButton onRefetch={refetch} />
            <AuthorityGuard roles={EVENT_MANAGER_ROLES}>
              <Button
                size="sm"
                className="h-9"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateEventOpen(true)}
              >
                Create Event
              </Button>
            </AuthorityGuard>
          </>
        }
      />

      <EventsStats events={events} total={meta?.total} loading={isLoading} />

      <EventsFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        setFilter={setFilter}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

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
          pageSizeOptions={EVENT_PAGE_SIZE_OPTIONS}
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
              pageSizeOptions={EVENT_PAGE_SIZE_OPTIONS}
            />
          </div>
        </QueryState>
      )}

      {editingEvent && (
        <EditEventPanel
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
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
