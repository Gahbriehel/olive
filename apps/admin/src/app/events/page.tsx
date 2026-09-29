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
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import {
  adaptApiEventToChurchEvent,
  EventCategory,
  EventStatus,
  getCategoryColor,
} from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";
import { AuthorityGuard } from "@/components/auth/AuthorityGuard";
import { ROLES } from "@/utils/rbac";

export default function EventsPage() {
  const router = useRouter();
  const { setIsCreateEventOpen } = useDashboard();

  // Filters State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search, 400);
  const [status, setStatus] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [admissionType, setAdmissionType] = useState<string>("All");
  const [featuredFilter, setFeaturedFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals State
  const [editingEvent, setEditingEvent] = useState<IChurchEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<IChurchEvent | null>(null);

  const queryParams = useMemo(() => {
    let requiresRegistration: boolean | undefined = undefined;
    if (admissionType === "TICKETED") requiresRegistration = true;
    if (admissionType === "OPEN") requiresRegistration = false;

    let isFeatured: boolean | undefined = undefined;
    if (featuredFilter === "FEATURED") isFeatured = true;
    if (featuredFilter === "STANDARD") isFeatured = false;

    return {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status !== "All" ? (status as EventStatus) : undefined,
      category: category !== "All" ? (category as EventCategory) : undefined,
      requiresRegistration,
      isFeatured,
    };
  }, [
    page,
    limit,
    debouncedSearch,
    status,
    category,
    admissionType,
    featuredFilter,
  ]);

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

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setPage(1);
  };

  const handleAdmissionChange = (newAdmission: string) => {
    setAdmissionType(newAdmission);
    setPage(1);
  };

  const handleFeaturedChange = (newFeatured: string) => {
    setFeaturedFilter(newFeatured);
    setPage(1);
  };

  // Metrics summary
  const totalEvents = meta?.total ?? events.length;
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
          card: "border-t-4 border-t-emerald-500 dark:border-t-emerald-400 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
          progress: "bg-emerald-500 dark:bg-emerald-400",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "DRAFT":
        return {
          card: "border-t-4 border-t-amber-500 dark:border-t-amber-400 bg-white dark:bg-zinc-900 hover:border-amber-500/50 dark:hover:border-amber-400/50",
          progress: "bg-amber-500 dark:bg-amber-400",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "COMPLETED":
        return {
          card: "border-t-4 border-t-indigo-500 dark:border-t-indigo-400 bg-white dark:bg-zinc-900 opacity-90 hover:opacity-100 hover:border-indigo-500/50",
          progress: "bg-indigo-600 dark:bg-indigo-500",
          badge: <StatusBadge status={eventStatus} />,
        };
      case "CANCELLED":
        return {
          card: "border-t-4 border-t-rose-500 dark:border-t-rose-400 bg-white dark:bg-zinc-900 opacity-75 hover:opacity-100 hover:border-rose-500/50",
          progress: "bg-rose-500 dark:bg-rose-400",
          badge: <StatusBadge status={eventStatus} dot={false} />,
        };
      default:
        return {
          card: "border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-white dark:bg-zinc-900",
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize conferences, worship vigils, open ministry programs, and
            ticketed summits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex h-9 items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 shadow-xs">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "h-7.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
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
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200",
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
          loading={isLoading}
        />
        <StatsCard
          title="Ticketed Events"
          value={ticketedEvents.toLocaleString()}
          change="Registration required"
          trend="neutral"
          icon={Ticket}
          color="cyan"
          loading={isLoading}
        />
        <StatsCard
          title="Open Admission"
          value={openServices.toLocaleString()}
          change="Open church services"
          trend="neutral"
          icon={DoorOpen}
          color="amber"
          loading={isLoading}
        />
        <StatsCard
          title="Total Registered"
          value={totalRegistrations.toLocaleString()}
          change="Confirmed attendees"
          trend="up"
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
      </StatsCardGroup>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status filter */}
          <div>
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              <option value="All">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          {/* Ministry Category filter */}
          <div>
            <Select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="GENERAL">GENERAL</option>
              <option value="CONFERENCE">CONFERENCE</option>
              <option value="VIGIL">VIGIL</option>
              <option value="COMMUNION">COMMUNION</option>
              <option value="REVIVAL">REVIVAL</option>
              <option value="WORSHIP">WORSHIP</option>
              <option value="OUTREACH">OUTREACH</option>
            </Select>
          </div>

          {/* Admission Type filter */}
          <div>
            <Select
              value={admissionType}
              onChange={(e) => handleAdmissionChange(e.target.value)}
            >
              <option value="All">All Admission Types</option>
              <option value="TICKETED">Registration Required</option>
              <option value="OPEN">Open Admission</option>
            </Select>
          </div>
        </div>

        {/* Sub-bar for quick chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              Quick Filter:
            </span>
            <button
              onClick={() => handleFeaturedChange("All")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
                featuredFilter === "All"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700",
              )}
            >
              All Events
            </button>
            <button
              onClick={() => handleFeaturedChange("FEATURED")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                featuredFilter === "FEATURED"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60",
              )}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Featured On Website
            </button>
            <button
              onClick={() => handleAdmissionChange("OPEN")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                admissionType === "OPEN"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60",
              )}
            >
              <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
              Open Admission
            </button>
            <button
              onClick={() => handleAdmissionChange("TICKETED")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer",
                admissionType === "TICKETED"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60",
              )}
            >
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              Registration Required
            </button>
          </div>

          {(search ||
            status !== "All" ||
            category !== "All" ||
            admissionType !== "All" ||
            featuredFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("All");
                setCategory("All");
                setAdmissionType("All");
                setFeaturedFilter("All");
                setPage(1);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Content: Table View vs Grid View */}
      {events.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No events found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or create a new event.
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-zinc-800 select-none">
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
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {events.map((evt) => {
                  const categoryColor = getCategoryColor(evt.category);
                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Column 1: Title & Badge */}
                      <td className="p-3.5 pl-4 align-middle">
                        <div className="flex items-center gap-3">
                          {evt.imageUrl && (
                            <div
                              onClick={() => router.push(`/events/${evt.id}`)}
                              className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity"
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
                                className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
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
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
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
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                            <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                            Registration Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                            Open Admission
                          </span>
                        )}
                      </td>

                      {/* Column 4: Capacity / Attendance */}
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        {evt.requiresRegistration ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {evt.registeredCount}/
                              {evt.capacity !== null &&
                              evt.capacity !== undefined
                                ? evt.capacity
                                : "∞"}
                            </span>
                            {evt.capacity ? (
                              <div className="w-24 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
                              <p className="text-[10px] text-slate-400">
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
                        <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                          <p className="font-medium truncate max-w-[180px]">
                            {evt.location || "Sanctuary"}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
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
                      className="relative w-full h-36 bg-slate-100 dark:bg-zinc-800 overflow-hidden border-b border-slate-100 dark:border-zinc-800 cursor-pointer"
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
                        className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {evt.name}
                      </CardTitle>
                    </div>

                    <ActionsList actions={getEventActions(evt)} />
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description || "No description provided."}
                    </p>

                    {/* Highlights pill preview */}
                    {evt.highlights && evt.highlights.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Highlights
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {evt.highlights.slice(0, 3).map((h, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-600 dark:text-slate-300"
                            >
                              • {h}
                            </span>
                          ))}
                          {evt.highlights.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{evt.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
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
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
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

                <div className="p-4 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>View Event Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {evt.requiresRegistration && (
                    <button
                      onClick={() => router.push(`/events/${evt.id}?tab=teams`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
      <div className="p-3.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shadow-xs">
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

          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
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
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
            onClick={() => setPage(page + 1)}
            disabled={page >= (meta?.totalPages ?? 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(meta?.totalPages ?? 1)}
            disabled={page >= (meta?.totalPages ?? 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
          display={Boolean(editingEvent)}
          close={() => setEditingEvent(null)}
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
