import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Calendar,
  Radio,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/helpers/cn";
import { ActionsList } from "@/components/ui/ActionsList";
import { StatsCard } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useEvents } from "@/hooks/useEvents";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { ChurchEvent } from "@/types/dashboard";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES } from "@/utils/rbac";

interface EventsViewProps {
  events: ChurchEvent[];
  onSelectEvent: (event: ChurchEvent) => void;
  onOpenCreateEvent: () => void;
  onPublishToggle?: (eventId: string) => void;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onRefetch?: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSelectEvent,
  onOpenCreateEvent,
  onPublishToggle = () => {},
  meta,
  page = 1,
  onPageChange,
  limit = 10,
  onLimitChange,
  search: externalSearch,
  onSearchChange,
  statusFilter = "All",
  onStatusFilterChange,
  onRefetch,
}) => {
  const [prevExternalSearch, setPrevExternalSearch] = useState(externalSearch);
  const [search, setSearch] = useState(externalSearch ?? "");

  if (externalSearch !== undefined && externalSearch !== prevExternalSearch) {
    setPrevExternalSearch(externalSearch);
    setSearch(externalSearch);
  }

  const debouncedSearchTerm = useDebouncedSearch(search, 500);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ChurchEvent | null>(null);
  const { updateEvent, deleteEvent } = useEvents();

  const onSearchChangeRef = React.useRef(onSearchChange);
  const prevDebouncedSearchRef = React.useRef(debouncedSearchTerm);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  });

  useEffect(() => {
    if (
      onSearchChangeRef.current &&
      prevDebouncedSearchRef.current !== debouncedSearchTerm
    ) {
      prevDebouncedSearchRef.current = debouncedSearchTerm;
      onSearchChangeRef.current(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const draftEvents = events.filter((e) => e.status === "DRAFT").length;
  const totalRegistrations = events.reduce(
    (sum, e) => sum + e.registeredCount,
    0,
  );

  const getCardStatusStyles = (status: ChurchEvent["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return {
          card: "border-t-4 border-t-emerald-500 dark:border-t-emerald-400 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
          progress: "bg-emerald-500 dark:bg-emerald-400",
          badge: (
            <Badge variant="emerald">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Published
            </Badge>
          ),
        };
      case "DRAFT":
        return {
          card: "border-t-4 border-t-amber-500 dark:border-t-amber-400 bg-white dark:bg-zinc-900 hover:border-amber-500/50 dark:hover:border-amber-400/50",
          progress: "bg-amber-500 dark:bg-amber-400",
          badge: (
            <Badge variant="amber" dot>
              Draft
            </Badge>
          ),
        };
      case "COMPLETED":
        return {
          card: "border-t-4 border-t-indigo-500 dark:border-t-indigo-400 bg-white dark:bg-zinc-900 opacity-90 hover:opacity-100 hover:border-indigo-500/50",
          progress: "bg-indigo-600 dark:bg-indigo-500",
          badge: <Badge variant="indigo">Completed</Badge>,
        };
      case "CANCELLED":
        return {
          card: "border-t-4 border-t-rose-500 dark:border-t-rose-400 bg-white dark:bg-zinc-900 opacity-75 hover:opacity-100 hover:border-rose-500/50",
          progress: "bg-rose-500 dark:bg-rose-400",
          badge: <Badge variant="rose">Cancelled</Badge>,
        };
      default:
        return {
          card: "border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-white dark:bg-zinc-900",
          progress: "bg-slate-400 dark:bg-slate-500",
          badge: <Badge variant="slate">{status}</Badge>,
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize conferences, worship nights, leadership retreats, and
            community events.
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefetch={onRefetch} />
          <AuthorityGuard
            roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR]}
          >
            <Button
              variant="primary"
              onClick={onOpenCreateEvent}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Event
            </Button>
          </AuthorityGuard>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={totalEvents.toLocaleString()}
          change="All platform events"
          trend="neutral"
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Published Events"
          value={publishedEvents.toLocaleString()}
          change="Currently active"
          trend="up"
          icon={Radio}
          color="emerald"
        />
        <StatsCard
          title="Draft Events"
          value={draftEvents.toLocaleString()}
          change="In preparation"
          trend="neutral"
          icon={Layers}
          color="amber"
        />
        <StatsCard
          title="Total Registered"
          value={totalRegistrations.toLocaleString()}
          change="Across all events"
          trend="up"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search events by title or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange && onStatusFilterChange(e.target.value)
            }
            leftIcon={<Filter className="w-4 h-4" />}
          >
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const statusStyle = getCardStatusStyles(evt.status);
            const capPct = Math.round(
              (evt.registeredCount / Math.max(evt.capacity, 1)) * 100,
            );
            return (
              <Card
                key={evt.id}
                className={cn(
                  "transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/40 overflow-hidden group",
                  statusStyle.card,
                )}
              >
                <div>
                  {evt.imageUrl && (
                    <div className="relative w-full h-36 bg-slate-100 dark:bg-zinc-800 overflow-hidden border-b border-slate-100 dark:border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.imageUrl}
                        alt={evt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {statusStyle.badge}
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                          {evt.category}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {evt.name}
                      </CardTitle>
                    </div>

                    {/* Options menu dropdown */}
                    <ActionsList
                      actions={[
                        {
                          title: "View Event Details",
                          fn: () => onSelectEvent(evt),
                        },
                        {
                          title: "Edit Event",
                          fn: () => setEditingEvent(evt),
                        },
                        {
                          title:
                            evt.status === "DRAFT"
                              ? "Publish Event"
                              : "Unpublish",
                          fn: () => onPublishToggle(evt.id),
                        },
                        {
                          title: "Delete Event",
                          fn: () => setDeletingEvent(evt),
                          destructive: true,
                        },
                      ]}
                    />
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate font-medium">
                          {evt.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium">
                          Deadline:{" "}
                          {new Date(
                            evt.registrationDeadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Registration Capacity
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {evt.registeredCount.toLocaleString()} /{" "}
                          {evt.capacity.toLocaleString()} ({capPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            statusStyle.progress,
                          )}
                          style={{ width: `${Math.min(capPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center group-hover:border-indigo-500/50 transition-colors"
                    onClick={() => onSelectEvent(evt)}
                  >
                    Manage Event & View Dashboard
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {onPageChange && (
        <div className="p-3.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {(page - 1) * limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {Math.min(page * limit, meta?.total ?? events.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {meta?.total ?? events.length}
              </span>{" "}
              results
            </span>

            {onLimitChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs">
              Page{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {meta?.totalPages ?? 1}
              </span>
            </span>

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= (meta?.totalPages ?? 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(meta?.totalPages ?? 1)}
              disabled={page >= (meta?.totalPages ?? 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editingEvent && (
        <SidebarModal
          title="Edit Event"
          display={Boolean(editingEvent)}
          close={() => setEditingEvent(null)}
        >
          <EventsForm
            initialValues={{
              id: editingEvent.id,
              title: editingEvent.name,
              description: editingEvent.description,
              location: editingEvent.location,
              startDate: editingEvent.startDate,
              endDate: editingEvent.endDate,
              status: editingEvent.status,
              imageUrl: editingEvent.imageUrl,
              googleCalendarSync: editingEvent.googleCalendarSync,
            }}
            onCancel={() => setEditingEvent(null)}
            onSubmit={async (data) => {
              await updateEvent({
                id: editingEvent.id,
                dto: {
                  title: data.title,
                  description: data.description,
                  location: data.location,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  status: data.status,
                  imageUrl: data.imageUrl,
                  googleCalendarSync: data.googleCalendarSync,
                },
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
};
