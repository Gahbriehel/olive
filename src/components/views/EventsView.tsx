import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Clock,
  CheckCircle2,
  Eye,
  Calendar,
  Radio,
  Users,
  Layers,
  Edit,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/helpers/cn";
import { StatsCard } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { useEvents } from "@/hooks/useEvents";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { ChurchEvent } from "@/types/dashboard";

interface EventsViewProps {
  events: ChurchEvent[];
  onSelectEvent: (event: ChurchEvent) => void;
  onOpenCreateEvent: () => void;
  onPublishToggle?: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onSelectEvent,
  onOpenCreateEvent,
  onPublishToggle = () => {},
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebouncedSearch(search, 1000);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const { updateEvent, deleteEvent } = useEvents();

  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-event-menu]")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const draftEvents = events.filter((e) => e.status === "DRAFT").length;
  const totalRegistrations = events.reduce(
    (sum, e) => sum + e.registeredCount,
    0,
  );

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCardStatusStyles = (status: ChurchEvent["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return {
          card: "border-t-4 border-t-emerald-500 dark:border-t-emerald-400 bg-gradient-to-b from-emerald-500/[0.04] to-transparent hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-emerald-500/10",
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
          card: "border-t-4 border-t-amber-500 dark:border-t-amber-400 bg-gradient-to-b from-amber-500/[0.04] to-transparent hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:shadow-amber-500/10",
          progress: "bg-amber-500 dark:bg-amber-400",
          badge: (
            <Badge variant="amber" dot>
              Draft
            </Badge>
          ),
        };
      case "COMPLETED":
        return {
          card: "border-t-4 border-t-indigo-500 dark:border-t-indigo-400 bg-gradient-to-b from-indigo-500/[0.03] to-transparent opacity-90 hover:opacity-100 hover:border-indigo-500/50",
          progress: "bg-indigo-600 dark:bg-indigo-500",
          badge: <Badge variant="indigo">Completed</Badge>,
        };
      case "CANCELLED":
        return {
          card: "border-t-4 border-t-rose-500 dark:border-t-rose-400 bg-gradient-to-b from-rose-500/[0.04] to-transparent opacity-75 hover:opacity-100 hover:border-rose-500/50",
          progress: "bg-rose-500 dark:bg-rose-400",
          badge: <Badge variant="rose">Cancelled</Badge>,
        };
      default:
        return {
          card: "border-t-4 border-t-slate-400 dark:border-t-slate-600 bg-gradient-to-b from-slate-500/[0.03] to-transparent",
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
            Organize youth conferences, worship nights, leadership retreats, and
            community events.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onOpenCreateEvent}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Event
        </Button>
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
            onChange={(e) => setStatusFilter(e.target.value)}
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
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          No data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => {
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
                    <div className="relative" data-event-menu>
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === evt.id ? null : evt.id,
                          )
                        }
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === evt.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 z-30 animate-fade-in text-xs">
                          <button
                            onClick={() => {
                              onSelectEvent(evt);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-left"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            View Event Details
                          </button>
                          <button
                            onClick={() => {
                              setEditingEvent(evt);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-left text-slate-700 dark:text-slate-300"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-500" />
                            Edit Event
                          </button>
                          <button
                            onClick={() => {
                              onPublishToggle(evt.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-left text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {evt.status === "DRAFT"
                              ? "Publish Event"
                              : "Unpublish"}
                          </button>
                        </div>
                      )}
                    </div>
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
    </div>
  );
};
