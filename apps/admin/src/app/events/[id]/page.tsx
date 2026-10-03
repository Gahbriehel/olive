"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  QrCode,
  Users,
  UserCheck,
  Shield,
  Gamepad2,
  Edit,
  Trash2,
  Star,
  Sparkles,
  Ticket,
  DoorOpen,
  Search,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useEvents } from "@/hooks/useEvents";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiGameToGame } from "@/models/game";
import { EventCategory, getCategoryColor } from "@/models/event";
import { cn } from "@/helpers/cn";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const initialTab = searchParams.get("tab") || "overview";

  const { events, setIsQrScannerOpen } = useDashboard();
  const { updateEvent, deleteEvent } = useEvents();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Teams Query: Fetch all teams for this event (limit: 100)
  const teamsParams = useMemo(() => ({ eventId, limit: 100 }), [eventId]);
  const { teams: apiTeams } = useTeams(teamsParams);

  // Games & Leaderboard Query
  const gamesParams = useMemo(() => ({ eventId }), [eventId]);
  const { games: apiGames, leaderboard } = useGames(gamesParams);

  // Full Roster Query (limit: 1000): Complete attendee pool for team roster mapping
  const fullRosterParams = useMemo(
    () => ({ eventId, limit: 1000, page: 1 }),
    [eventId],
  );
  const { registrations: apiAllRegistrations } =
    useRegistrations(fullRosterParams);

  // Paginated Registrations Query (for the dedicated Registrations tab)
  const [regPage, setRegPage] = useState(1);
  const [regLimit, setRegLimit] = useState(10);
  const [regSearch, setRegSearch] = useState("");
  const debouncedRegSearch = useDebouncedSearch(regSearch, 400);
  const [regStatusFilter, setRegStatusFilter] = useState("ALL");

  const paginatedRegParams = useMemo(
    () => ({
      eventId,
      page: regPage,
      limit: regLimit,
      search: debouncedRegSearch || undefined,
      status: regStatusFilter !== "ALL" ? regStatusFilter : undefined,
    }),
    [eventId, regPage, regLimit, debouncedRegSearch, regStatusFilter],
  );

  const {
    registrations: apiPaginatedRegistrations,
    meta: regMeta,
    isLoading: isPaginatedRegLoading,
  } = useRegistrations(paginatedRegParams);

  // Teams & Roster Filter and Collapsible State (Collapsed by default)
  const [teamRosterFilter, setTeamRosterFilter] = useState<string>("ALL");
  const [rosterSearch, setRosterSearch] = useState<string>("");
  const debouncedRosterSearch = useDebouncedSearch(rosterSearch, 300);
  const [rosterPage, setRosterPage] = useState<Record<string, number>>({});
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const selectedEvent = events.find((e) => e.id === eventId) || events[0];

  const allRegistrations = useMemo(
    () =>
      Array.isArray(apiAllRegistrations)
        ? apiAllRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiAllRegistrations],
  );

  const paginatedRegistrations = useMemo(
    () =>
      Array.isArray(apiPaginatedRegistrations)
        ? apiPaginatedRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiPaginatedRegistrations],
  );

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const games = useMemo(
    () =>
      Array.isArray(apiGames)
        ? apiGames.map((g) => adaptApiGameToGame(g, teams))
        : [],
    [apiGames, teams],
  );

  const enrichedTeams = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return teams;

    const lbMap = new Map(leaderboard.map((lb) => [lb.teamId, lb]));

    const merged = teams.map((t) => {
      const lbEntry = lbMap.get(t.id);
      if (!lbEntry) return t;
      const rawColor = lbEntry.colorHex || lbEntry.color || t.colorHex;
      const colorHex = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      return {
        ...t,
        totalPoints: lbEntry.totalScore ?? lbEntry.totalPoints ?? t.totalPoints,
        memberCount: lbEntry.memberCount ?? t.memberCount,
        colorHex,
      };
    });

    return merged.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teams, leaderboard]);

  // Group all attendees into teams from the full roster
  const { teamRosterMap, unassignedRoster } = useMemo(() => {
    const map = new Map<string, typeof allRegistrations>();
    for (const team of enrichedTeams) {
      map.set(team.id, []);
    }
    const unassigned: typeof allRegistrations = [];

    for (const reg of allRegistrations) {
      const teamId = reg.assignedTeamId || reg.team?.id;
      if (teamId && map.has(teamId)) {
        map.get(teamId)!.push(reg);
      } else {
        const matchingTeam = enrichedTeams.find(
          (t) =>
            t.name.toLowerCase() === reg.team?.name?.toLowerCase() ||
            t.id === reg.assignedTeamId,
        );
        if (matchingTeam && map.has(matchingTeam.id)) {
          map.get(matchingTeam.id)!.push(reg);
        } else {
          unassigned.push(reg);
        }
      }
    }

    return { teamRosterMap: map, unassignedRoster: unassigned };
  }, [enrichedTeams, allRegistrations]);

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const isAllExpanded = useMemo(() => {
    if (enrichedTeams.length === 0) return false;
    return enrichedTeams.every((t) => expandedTeams[t.id]);
  }, [enrichedTeams, expandedTeams]);

  const handleToggleAllTeams = () => {
    if (isAllExpanded) {
      setExpandedTeams({});
    } else {
      const allExpanded: Record<string, boolean> = { UNASSIGNED: true };
      enrichedTeams.forEach((t) => {
        allExpanded[t.id] = true;
      });
      setExpandedTeams(allExpanded);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "registrations",
      label: "Registrations",
      count: regMeta?.total ?? allRegistrations.length,
    },
    {
      id: "teams",
      label: "Teams & Roster",
      count: allRegistrations.length || enrichedTeams.length,
    },
    { id: "games", label: "Games", count: games.length },
  ];

  if (!selectedEvent) {
    return (
      <div className="p-8 text-center text-slate-500">Event not found.</div>
    );
  }

  const categoryColor = getCategoryColor(selectedEvent.category);
  const totalCount = regMeta?.total ?? allRegistrations.length;
  const capPct =
    selectedEvent.capacity && selectedEvent.capacity > 0
      ? Math.round((totalCount / selectedEvent.capacity) * 100)
      : 0;

  const checkinPct =
    totalCount > 0
      ? Math.round((selectedEvent.checkedInCount / totalCount) * 100)
      : 0;
  const completedGames = games.filter((g) => g.status === "Completed").length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-slate-300 dark:hover:bg-zinc-700 dark:hover:text-slate-100 cursor-pointer shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {selectedEvent.name}
              </h1>
              <Badge color={categoryColor} size="sm">
                {selectedEvent.category}
              </Badge>
              {selectedEvent.isFeatured && (
                <Badge
                  color="gold"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-amber-500" />
                  FEATURED
                </Badge>
              )}
              <StatusBadge status={selectedEvent.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              {selectedEvent.requiresRegistration ? (
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Ticket className="w-3 h-3" /> Registration Required
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <DoorOpen className="w-3 h-3" /> Open Admission
                </span>
              )}
              <span>•</span>
              <span>
                {new Date(selectedEvent.startDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-slate-200 dark:hover:bg-zinc-700 dark:hover:text-indigo-400 cursor-pointer shadow-xs"
          >
            <Edit className="w-3.5 h-3.5 text-amber-500" />
            <span>Edit Event</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/60 px-3.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <StatsCardGroup>
            <StatsCard
              title={
                selectedEvent.requiresRegistration
                  ? "Capacity Used"
                  : "Admission Mode"
              }
              value={
                selectedEvent.requiresRegistration
                  ? `${capPct}%`
                  : "Open Admission"
              }
              change={
                selectedEvent.requiresRegistration
                  ? `${totalCount} of ${selectedEvent.capacity ?? "∞"} seats`
                  : "No registration required"
              }
              trend="neutral"
              icon={selectedEvent.requiresRegistration ? Users : DoorOpen}
              color="indigo"
            />
            <StatsCard
              title="Checked-In Count"
              value={`${selectedEvent.checkedInCount}`}
              change={
                selectedEvent.requiresRegistration
                  ? `${checkinPct}% check-in rate`
                  : "Walk-in check-ins"
              }
              trend="up"
              icon={UserCheck}
              color="emerald"
            />
            <StatsCard
              title="Assigned Teams"
              value={`${enrichedTeams.length} Teams`}
              change="Balanced allocation"
              trend="neutral"
              icon={Shield}
              color="cyan"
            />
            <StatsCard
              title="Games Tournament"
              value={`${games.length} Contests`}
              change={`${completedGames} games completed`}
              trend="up"
              icon={Gamepad2}
              color="amber"
            />
          </StatsCardGroup>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              {selectedEvent.imageUrl && (
                <div className="relative w-full h-48 bg-slate-100 dark:bg-zinc-800 overflow-hidden border-b border-slate-100 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>Event Details & Schedule</CardTitle>
                <CardDescription>
                  Main venue and registration deadlines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Location:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {selectedEvent.location || "Main Sanctuary"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Event Dates:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {new Date(selectedEvent.startDate).toLocaleString()} –{" "}
                    {new Date(selectedEvent.endDate).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Admission Type:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {selectedEvent.requiresRegistration
                      ? `Registration Required (Capacity: ${selectedEvent.capacity ?? "Unlimited"})`
                      : "Open Admission (No pre-registration required)"}
                  </p>
                </div>

                {/* Program Highlights */}
                {selectedEvent.highlights &&
                  selectedEvent.highlights.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 space-y-2">
                      <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Program Highlights:
                      </p>
                      <ul className="space-y-1 pl-1">
                        {selectedEvent.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                          >
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance & Desk Tools</CardTitle>
                <CardDescription>
                  QR scanner and live participant tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setIsQrScannerOpen(true)}
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  Launch QR Check-in Terminal
                </Button>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Team Auto-Balancing
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Attendees are automatically distributed evenly across House
                    Teams upon registration checkout.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content 2: Registrations (Full Server Pagination) */}
      {activeTab === "registrations" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>
                Full list of confirmed attendees with server-side pagination
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                Total: {regMeta?.total ?? allRegistrations.length}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filter Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search by attendee name, email, or registration #..."
                  value={regSearch}
                  onChange={(e) => {
                    setRegSearch(e.target.value);
                    setRegPage(1);
                  }}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <Select
                  value={regStatusFilter}
                  onChange={(e) => {
                    setRegStatusFilter(e.target.value);
                    setRegPage(1);
                  }}
                  leftIcon={<Filter className="w-4 h-4" />}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REGISTERED">Registered / Confirmed</option>
                  <option value="CHECKED_IN">Checked-In</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
            </div>

            {isPaginatedRegLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading event registrations...
              </div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No registrations found matching your criteria.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedRegistrations.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {r.name}
                          </p>
                          <StatusBadge status={r.membershipStatus} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {r.email} • {r.phone} • Reg #{r.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {r.team?.name && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{
                            backgroundColor: r.team.colorHex || "#6366f1",
                          }}
                        >
                          {r.team.name}
                        </span>
                      )}
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {Boolean(regMeta?.total && regMeta.total > 0) && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {(regPage - 1) * regLimit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {Math.min(regPage * regLimit, regMeta?.total ?? 0)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {regMeta?.total ?? 0}
                    </span>{" "}
                    results
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Rows:</span>
                    <select
                      value={regLimit}
                      onChange={(e) => {
                        setRegLimit(Number(e.target.value));
                        setRegPage(1);
                      }}
                      className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-base py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      {[10, 25, 50, 100].map((size) => (
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
                    onClick={() => setRegPage(1)}
                    disabled={regPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegPage(regPage - 1)}
                    disabled={regPage <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 text-xs">
                    Page{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {regPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {regMeta?.totalPages || 1}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setRegPage(regPage + 1)}
                    disabled={regPage >= (regMeta?.totalPages || 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegPage(regMeta?.totalPages || 1)}
                    disabled={regPage >= (regMeta?.totalPages || 1)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content 3: Teams & Roster (Collapsible Teams with Member Rosters) */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {/* Header & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  House Teams & Attendee Rosters
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete event roster ({allRegistrations.length} total
                  attendees). Click any team card below to expand its roster.
                </p>
              </div>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search roster by name, email, or reg #..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                />
              </div>
            </div>

            {/* Quick Team Filter Chips & Expand All Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTeamRosterFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    teamRosterFilter === "ALL"
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700",
                  )}
                >
                  All Teams ({allRegistrations.length})
                </button>
                {enrichedTeams.map((t) => {
                  const count = (teamRosterMap.get(t.id) || []).length;
                  const isSelected = teamRosterFilter === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTeamRosterFilter(t.id);
                        // Auto-expand the filtered team
                        setExpandedTeams((prev) => ({ ...prev, [t.id]: true }));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                        isSelected
                          ? "text-white shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700",
                      )}
                      style={{
                        backgroundColor: isSelected ? t.colorHex : undefined,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: isSelected ? "#ffffff" : t.colorHex,
                        }}
                      />
                      <span>{t.name}</span>
                      <span className="opacity-80">({count})</span>
                    </button>
                  );
                })}
                {unassignedRoster.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTeamRosterFilter("UNASSIGNED");
                      setExpandedTeams((prev) => ({
                        ...prev,
                        UNASSIGNED: true,
                      }));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      teamRosterFilter === "UNASSIGNED"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100",
                    )}
                  >
                    Unassigned ({unassignedRoster.length})
                  </button>
                )}
              </div>

              {enrichedTeams.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleAllTeams}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {isAllExpanded
                    ? "Collapse All Rosters"
                    : "Expand All Rosters"}
                </button>
              )}
            </div>
          </div>

          {/* Teams Rosters List (Collapsible Cards) */}
          <div className="space-y-4">
            {enrichedTeams
              .filter(
                (t) => teamRosterFilter === "ALL" || teamRosterFilter === t.id,
              )
              .map((t, idx) => {
                const fullTeamMembers = (teamRosterMap.get(t.id) || []).filter(
                  (m) =>
                    !debouncedRosterSearch ||
                    m.name
                      .toLowerCase()
                      .includes(debouncedRosterSearch.toLowerCase()) ||
                    m.email
                      .toLowerCase()
                      .includes(debouncedRosterSearch.toLowerCase()) ||
                    m.registrationNumber
                      .toLowerCase()
                      .includes(debouncedRosterSearch.toLowerCase()),
                );

                const checkedInCount = fullTeamMembers.filter(
                  (m) => m.status === "Checked-In",
                ).length;

                // Per-team pagination (10 per page)
                const teamPage = rosterPage[t.id] || 1;
                const teamLimit = 10;
                const totalTeamPages = Math.ceil(
                  fullTeamMembers.length / teamLimit,
                );
                const paginatedTeamMembers = fullTeamMembers.slice(
                  (teamPage - 1) * teamLimit,
                  teamPage * teamLimit,
                );

                const isExpanded = Boolean(expandedTeams[t.id]);

                return (
                  <Card key={t.id} className="overflow-hidden shadow-xs">
                    {/* Collapsible Team Header Bar */}
                    <div
                      onClick={() => toggleTeamExpanded(t.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors select-none"
                      style={{ borderLeft: `4px solid ${t.colorHex}` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 font-bold text-xs flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {t.name}
                            </h3>
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
                              style={{ backgroundColor: t.colorHex }}
                            >
                              Team Roster
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {fullTeamMembers.length} Assigned Member
                            {fullTeamMembers.length === 1 ? "" : "s"} •{" "}
                            {checkedInCount} Checked In
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 font-mono text-slate-700 dark:text-slate-300">
                          Score:{" "}
                          <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.totalPoints} pts
                          </strong>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                          <span className="text-[11px] font-medium hidden sm:inline">
                            {isExpanded ? "Hide Roster" : "View Roster"}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded && "rotate-180 text-indigo-500",
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Member Roster Content (Expanded) */}
                    {isExpanded && (
                      <CardContent className="p-0 border-t border-slate-100 dark:border-zinc-800 animate-fade-in">
                        {fullTeamMembers.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">
                            {debouncedRosterSearch
                              ? `No members found matching "${debouncedRosterSearch}" on this team.`
                              : "No attendees currently assigned to this team."}
                          </div>
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/70 dark:bg-zinc-800/40 text-slate-500 font-semibold border-b border-slate-100 dark:border-zinc-800">
                                  <tr>
                                    <th className="p-3 pl-4">Member Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Reg #</th>
                                    <th className="p-3">Membership</th>
                                    <th className="p-3 pr-4 text-right">
                                      Check-in Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                  {paginatedTeamMembers.map((m) => (
                                    <tr
                                      key={m.id}
                                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                                    >
                                      {/* Member */}
                                      <td className="p-3 pl-4 align-middle">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                                            {m.name.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {m.name}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Contact */}
                                      <td className="p-3 align-middle text-slate-500 dark:text-slate-400">
                                        <div className="space-y-0.5 text-[11px]">
                                          {m.email && m.email !== "N/A" && (
                                            <p className="flex items-center gap-1">
                                              <Mail className="w-3 h-3 text-slate-400" />
                                              {m.email}
                                            </p>
                                          )}
                                          {m.phone && m.phone !== "N/A" && (
                                            <p className="flex items-center gap-1">
                                              <Phone className="w-3 h-3 text-slate-400" />
                                              {m.phone}
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      {/* Reg # */}
                                      <td className="p-3 align-middle font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                        {m.registrationNumber}
                                      </td>

                                      {/* Membership */}
                                      <td className="p-3 align-middle">
                                        <StatusBadge
                                          status={m.membershipStatus}
                                          size="sm"
                                        />
                                      </td>

                                      {/* Check-in */}
                                      <td className="p-3 pr-4 align-middle text-right">
                                        <StatusBadge
                                          status={m.status}
                                          size="sm"
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Team Pagination Bar if > 10 members */}
                            {totalTeamPages > 1 && (
                              <div className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                  Showing{" "}
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {(teamPage - 1) * teamLimit + 1}
                                  </span>{" "}
                                  to{" "}
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {Math.min(
                                      teamPage * teamLimit,
                                      fullTeamMembers.length,
                                    )}
                                  </span>{" "}
                                  of{" "}
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {fullTeamMembers.length}
                                  </span>{" "}
                                  members
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRosterPage((prev) => ({
                                        ...prev,
                                        [t.id]: Math.max(
                                          (prev[t.id] || 1) - 1,
                                          1,
                                        ),
                                      }));
                                    }}
                                    disabled={teamPage <= 1}
                                    className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    title="Previous Page"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2 text-[11px]">
                                    {teamPage} / {totalTeamPages}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRosterPage((prev) => ({
                                        ...prev,
                                        [t.id]: Math.min(
                                          (prev[t.id] || 1) + 1,
                                          totalTeamPages,
                                        ),
                                      }));
                                    }}
                                    disabled={teamPage >= totalTeamPages}
                                    className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    title="Next Page"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}

            {/* Unassigned Roster (Collapsible) */}
            {(teamRosterFilter === "ALL" ||
              teamRosterFilter === "UNASSIGNED") &&
              unassignedRoster.length > 0 && (
                <Card className="overflow-hidden border-amber-200 dark:border-amber-900/40 shadow-xs">
                  <div
                    onClick={() => toggleTeamExpanded("UNASSIGNED")}
                    className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between cursor-pointer hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-colors select-none"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-500" />
                        Unassigned Registrants Roster
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Attendees registered without team placement (
                        {unassignedRoster.length})
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 text-xs">
                      <span className="text-[11px] font-medium hidden sm:inline">
                        {expandedTeams["UNASSIGNED"]
                          ? "Hide Roster"
                          : "View Roster"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          expandedTeams["UNASSIGNED"] &&
                            "rotate-180 text-amber-600",
                        )}
                      />
                    </div>
                  </div>
                  {expandedTeams["UNASSIGNED"] && (
                    <CardContent className="p-0 animate-fade-in">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/70 dark:bg-zinc-800/40 text-slate-500 font-semibold border-b border-slate-100 dark:border-zinc-800">
                            <tr>
                              <th className="p-3 pl-4">Member Name</th>
                              <th className="p-3">Contact</th>
                              <th className="p-3">Reg #</th>
                              <th className="p-3">Membership</th>
                              <th className="p-3 pr-4 text-right">
                                Check-in Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {unassignedRoster.map((m) => (
                              <tr
                                key={m.id}
                                className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                              >
                                <td className="p-3 pl-4 align-middle">
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {m.name}
                                  </span>
                                </td>
                                <td className="p-3 align-middle text-slate-500">
                                  {m.email} • {m.phone}
                                </td>
                                <td className="p-3 align-middle font-mono">
                                  {m.registrationNumber}
                                </td>
                                <td className="p-3 align-middle">
                                  <StatusBadge
                                    status={m.membershipStatus}
                                    size="sm"
                                  />
                                </td>
                                <td className="p-3 pr-4 align-middle text-right">
                                  <StatusBadge status={m.status} size="sm" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
          </div>
        </div>
      )}

      {/* Tab Content 4: Games */}
      {activeTab === "games" && (
        <div className="space-y-3">
          {games.map((g, idx) => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {g.name}
                  </h4>
                  <p className="text-slate-400">Max Score: {g.maxScore} pts</p>
                </div>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Game #{idx + 1}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isEditing && (
        <SidebarModal
          title="Edit Event"
          display={isEditing}
          close={() => setIsEditing(false)}
        >
          <EventsForm
            initialValues={{
              id: selectedEvent.id,
              title: selectedEvent.name,
              category: selectedEvent.category as EventCategory,
              description: selectedEvent.description,
              location: selectedEvent.location,
              capacity: selectedEvent.capacity,
              startDate: selectedEvent.startDate,
              endDate: selectedEvent.endDate,
              status: selectedEvent.status,
              imageUrl: selectedEvent.imageUrl || undefined,
              googleCalendarSync: selectedEvent.googleCalendarSync,
              requiresRegistration: selectedEvent.requiresRegistration,
              highlights: selectedEvent.highlights || undefined,
              isFeatured: selectedEvent.isFeatured,
            }}
            onCancel={() => setIsEditing(false)}
            onSubmit={async (data) => {
              await updateEvent({
                id: selectedEvent.id,
                dto: data,
              });
              setIsEditing(false);
            }}
            onDelete={async () => {
              await deleteEvent(selectedEvent.id);
              setIsEditing(false);
              router.push("/events");
            }}
          />
        </SidebarModal>
      )}

      {confirmDeleteOpen && (
        <ConfirmActionModal
          display={confirmDeleteOpen}
          close={() => setConfirmDeleteOpen(false)}
          actionName="delete"
          title={`Are you sure you want to delete ${selectedEvent.name}?`}
          fn={async () => {
            await deleteEvent(selectedEvent.id);
            setConfirmDeleteOpen(false);
            router.push("/events");
          }}
        />
      )}
    </div>
  );
}
