"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Calendar,
  Radio,
  Users,
  Sparkles,
  Ticket,
  DoorOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/helpers/cn";
import { ActionsList } from "@/components/ui/ActionsList";
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

  const getCardStatusStyles = (eventStatus: IChurchEvent["status"]) => {
    switch (eventStatus) {
      case "PUBLISHED":
        return {
          card: "border-t-4 border-t-emerald-500 dark:border-t-emerald-400 bg-surface hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
          progress: "bg-emerald-500 dark:bg-emerald-400",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "DRAFT":
        return {
          card: "border-t-4 border-t-amber-500 dark:border-t-amber-400 bg-surface hover:border-amber-500/50 dark:hover:border-amber-400/50",
          progress: "bg-amber-500 dark:bg-amber-400",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "COMPLETED":
        return {
          card: "border-t-4 border-t-indigo-500 dark:border-t-indigo-400 bg-surface opacity-90 hover:opacity-100 hover:border-indigo-500/50",
          progress: "bg-indigo-600 dark:bg-indigo-500",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "CANCELLED":
        return {
          card: "border-t-4 border-t-rose-500 dark:border-t-rose-400 bg-surface opacity-75 hover:opacity-100 hover:border-rose-500/50",
          progress: "bg-rose-500 dark:bg-rose-400",
          badge: <StatusBadge status={eventStatus} dot={false} />,
        };
      default:
        return {
          card: "border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-surface",
          progress: "bg-slate-400 dark:bg-slate-500",
          badge: <StatusBadge status={eventStatus} />,
        };
    }
  };

  const getEventActions = (evt: IChurchEvent) => [
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
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted">
            Organize conferences, worship vigils, open ministry programs, and
            ticketed summits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex h-9 items-center p-0.5 rounded-xl bg-muted border border-border-control shadow-xs">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "h-7.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-surface text-primary-text shadow-xs"
                  : "text-slate-500 hover:text-fg",
              )}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-7.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-surface text-primary-text shadow-xs"
                  : "text-slate-500 hover:text-fg",
              )}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>

          <RefreshButton onRefetch={refetch} />
          <AuthorityGuard
            roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR]}
          >
            <button
              type="button"
              onClick={() => setIsCreateEventOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </AuthorityGuard>
        </div>
      </div>

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
          {/* Search input */}
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

        {/* Sub-bar for quick chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-semibold text-slate-400">
              Quick Filter:
            </span>
            <button
              onClick={() => setFilter("isFeatured", "")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
                !filters.isFeatured
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-muted text-fg-secondary hover:bg-muted-strong",
              )}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("isFeatured", "true")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                filters.isFeatured === "true"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-warning-soft text-warning-text hover:bg-warning-soft",
              )}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Featured On Website
            </button>
            <button
              onClick={() => setFilter("requiresRegistration", "false")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                filters.requiresRegistration === "false"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-success-soft text-success-text hover:bg-success-soft",
              )}
            >
              <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
              Open Admission
            </button>
            <button
              onClick={() => setFilter("requiresRegistration", "true")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                filters.requiresRegistration === "true"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-primary-soft text-primary-text hover:bg-primary-soft",
              )}
            >
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              Registration Required
            </button>
          </div>

          {(search || activeCount > 0) && (
            <button
              onClick={() => {
                setSearch("");
                clearFilters();
              }}
              className="text-xs text-primary-text hover:text-primary-text hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Content: Table View vs Grid View */}
      {events.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-surface rounded-2xl border border-border">
          <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
          <p className="font-semibold text-fg-secondary">No events found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or create a new event.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-fg-muted font-semibold border-b border-border select-none">
                <tr>
                  <th className="p-3.5 pl-4">Title & Badges</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Admission Type</th>
                  <th className="p-3.5">Capacity / Attendance</th>
                  <th className="p-3.5">Schedule & Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {events.map((evt) => {
                  const categoryColor = getCategoryColor(evt.category);
                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-subtle transition-colors group"
                    >
                      {/* Column 1: Title & Badge */}
                      <td className="p-3.5 pl-4 align-middle">
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
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  FEATURED
                                </Badge>
                              )}
                            </div>
                            {evt.description && (
                              <p className="text-2xs text-slate-400 line-clamp-1 max-w-xs">
                                {evt.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Category */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        <Badge color={categoryColor} size="sm">
                          {evt.category}
                        </Badge>
                      </td>

                      {/* Column 3: Admission Type */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        {evt.requiresRegistration ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-text">
                            <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                            Registration Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-text">
                            <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                            Open Admission
                          </span>
                        )}
                      </td>

                      {/* Column 4: Capacity / Attendance */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        {evt.requiresRegistration ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-semibold text-fg">
                              {evt.registeredCount}/
                              {evt.capacity !== null &&
                              evt.capacity !== undefined
                                ? evt.capacity
                                : "∞"}
                            </span>
                            {evt.capacity ? (
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      Math.round(
                                        (evt.registeredCount / evt.capacity) *
                                          100,
                                      ),
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-2xs text-slate-400">
                                Unlimited seats
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Open Admission
                          </span>
                        )}
                      </td>

                      {/* Column 5: Schedule & Location */}
                      <td className="p-3.5 align-middle">
                        <div className="space-y-0.5 text-fg-secondary">
                          <p className="font-medium truncate max-w-[180px]">
                            {evt.location || "Sanctuary"}
                          </p>
                          <p className="text-2xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(evt.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Column 6: Status */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        <StatusBadge status={evt.status} size="sm" />
                      </td>

                      {/* Column 7: Action Items (Prioritized ActionsList Menu) */}
                      <td className="p-3.5 pr-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <ActionsList actions={getEventActions(evt)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const statusStyle = getCardStatusStyles(evt.status);
            const categoryColor = getCategoryColor(evt.category);
            const capPct = evt.capacity
              ? Math.round(
                  (evt.registeredCount / Math.max(evt.capacity, 1)) * 100,
                )
              : 0;

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
                    <div
                      onClick={() => router.push(`/events/${evt.id}`)}
                      className="relative w-full h-36 bg-muted overflow-hidden border-b border-border-subtle cursor-pointer"
                    >
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {statusStyle.badge}
                        <Badge color={categoryColor} size="sm">
                          {evt.category}
                        </Badge>
                        {evt.isFeatured && (
                          <Badge
                            color="gold"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Star className="w-2.5 h-2.5 fill-amber-500" />
                            FEATURED
                          </Badge>
                        )}
                      </div>
                      <CardTitle
                        onClick={() => router.push(`/events/${evt.id}`)}
                        className="text-base font-bold text-fg hover:text-primary-text cursor-pointer transition-colors"
                      >
                        {evt.name}
                      </CardTitle>
                    </div>

                    <ActionsList actions={getEventActions(evt)} />
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                      {evt.description || "No description provided."}
                    </p>

                    {/* Highlights pill preview */}
                    {evt.highlights && evt.highlights.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-2xs font-semibold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Highlights
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {evt.highlights.slice(0, 3).map((h, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-muted text-2xs text-fg-secondary"
                            >
                              • {h}
                            </span>
                          ))}
                          {evt.highlights.length > 3 && (
                            <span className="text-2xs text-slate-400 self-center">
                              +{evt.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-fg-secondary bg-subtle p-2.5 rounded-xl border border-border-subtle">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate font-medium">
                          {evt.location || "Sanctuary"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium">
                          Schedule: {new Date(evt.startDate).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Admission & Capacity */}
                    <div className="p-2.5 rounded-xl bg-subtle border border-border-subtle space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-fg-secondary flex items-center gap-1.5">
                          {evt.requiresRegistration ? (
                            <>
                              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                              Registration Required
                            </>
                          ) : (
                            <>
                              <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                              Open Admission
                            </>
                          )}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {evt.requiresRegistration
                            ? `${evt.registeredCount}/${evt.capacity ?? "∞"}`
                            : "Open"}
                        </span>
                      </div>
                      {evt.requiresRegistration && evt.capacity && (
                        <div className="w-full h-1.5 bg-muted-strong rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              statusStyle.progress,
                            )}
                            style={{ width: `${Math.min(capPct, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-2 border-t border-border-subtle flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-text hover:text-primary-text transition-colors cursor-pointer"
                  >
                    <span>View Event Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {evt.requiresRegistration && (
                    <button
                      onClick={() => router.push(`/events/${evt.id}?tab=teams`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-fg transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-cyan-500" />
                      <span>View Teams</span>
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="p-3.5 border border-border bg-surface rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-muted shadow-xs">
        <div className="flex items-center gap-4">
          <span>
            Showing{" "}
            <span className="font-semibold text-fg">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-fg">
              {Math.min(page * limit, meta?.total ?? events.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-fg">
              {meta?.total ?? events.length}
            </span>{" "}
            results
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-2xs">Rows:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-surface-raised border border-border-control rounded-lg text-base py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 text-xs">
            Page <span className="font-semibold text-fg">{page}</span> of{" "}
            <span className="font-semibold text-fg">
              {meta?.totalPages ?? 1}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= (meta?.totalPages ?? 1)}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(meta?.totalPages ?? 1)}
            disabled={page >= (meta?.totalPages ?? 1)}
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-muted text-fg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
