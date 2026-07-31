import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { StatsCard } from "@/components/ui/StatsCard";
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

  const totalEvents = events.length;
  const liveEvents = events.filter((e) => e.status === "Live").length;
  const upcomingEvents = events.filter((e) => e.status === "Upcoming").length;
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

  const getStatusBadge = (status: ChurchEvent["status"]) => {
    switch (status) {
      case "Live":
        return (
          <Badge variant="emerald" dot>
            Live Now
          </Badge>
        );
      case "Upcoming":
        return (
          <Badge variant="indigo" dot>
            Upcoming
          </Badge>
        );
      case "Completed":
        return <Badge variant="slate">Completed</Badge>;
      case "Draft":
        return <Badge variant="amber">Draft</Badge>;
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
          title="Live Events"
          value={liveEvents.toLocaleString()}
          change="Currently active"
          trend="up"
          icon={Radio}
          color="emerald"
        />
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents.toLocaleString()}
          change="Scheduled next"
          trend="neutral"
          icon={Layers}
          color="cyan"
        />
        <StatsCard
          title="Total Registered"
          value={totalRegistrations.toLocaleString()}
          change="Across all events"
          trend="up"
          icon={Users}
          color="amber"
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
            <option value="Live">Live</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
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
            const capPct = Math.round(
              (evt.registeredCount / Math.max(evt.capacity, 1)) * 100,
            );
            return (
              <Card
                key={evt.id}
                className="hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(evt.status)}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {evt.category}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold">
                        {evt.name}
                      </CardTitle>
                    </div>

                    {/* Options menu dropdown */}
                    <div className="relative">
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
                              onPublishToggle(evt.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium text-left text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {evt.status === "Draft"
                              ? "Publish Event"
                              : "Unpublish"}
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Deadline:{" "}
                          {new Date(
                            evt.registrationDeadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Registration Capacity
                        </span>
                        <span className="font-mono text-slate-500">
                          {evt.registeredCount.toLocaleString()} /{" "}
                          {evt.capacity.toLocaleString()} ({capPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${Math.min(capPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
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
    </div>
  );
};
