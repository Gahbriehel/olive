"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarX,
  ClipboardList,
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
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import {
  EmptyState,
  ErrorState,
  QueryState,
  SkeletonCardGrid,
  SkeletonList,
} from "@/components/ui/QueryState";
import { EventsForm } from "@/components/Forms/EventsForm";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useEvents } from "@/hooks/useEvents";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiGameToGame } from "@/models/game";
import { EventCategory, getCategoryColor } from "@/models/event";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { TeamRostersTab } from "../_components/TeamRostersTab";

const regStatusField = {
  type: "select",
  key: "status",
  label: "Status",
  allLabel: "All Statuses",
  options: [
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Checked-In", value: "CHECKED_IN" },
    { label: "Cancelled", value: "CANCELLED" },
  ],
} satisfies FilterField;

const regFilterFields: FilterField[] = [regStatusField];

const REG_PAGE_SIZES = [10, 25, 50, 100];

const eventsCrumb = { label: "Events", href: "/events" };

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const initialTab = searchParams.get("tab") || "overview";

  const { events, setIsQrScannerOpen } = useDashboard();
  // Same query (and cache entry) the dashboard context reads `events` from;
  // used here for its loading / error state.
  const {
    updateEvent,
    deleteEvent,
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
    refetch: refetchEvents,
  } = useEvents();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Teams Query: Fetch all teams for this event (limit: 100)
  const teamsParams = useMemo(() => ({ eventId, limit: 100 }), [eventId]);
  const {
    teams: apiTeams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useTeams(teamsParams);

  // Games & Leaderboard Query
  const gamesParams = useMemo(() => ({ eventId }), [eventId]);
  const {
    games: apiGames,
    leaderboard,
    isLoadingGames,
    isLoadingLeaderboard,
    isError: isGamesError,
    error: gamesError,
    refetchGames,
  } = useGames(gamesParams);

  // Full Roster Query (limit: 1000): Complete attendee pool for team roster mapping
  const fullRosterParams = useMemo(
    () => ({ eventId, limit: 1000, page: 1 }),
    [eventId],
  );
  const {
    registrations: apiAllRegistrations,
    isLoading: isRosterLoading,
    isError: isRosterError,
    refetch: refetchRoster,
  } = useRegistrations(fullRosterParams);

  // Paginated Registrations Query (for the dedicated Registrations tab)
  const {
    page: regPage,
    setPage: setRegPage,
    limit: regLimit,
    setLimit: setRegLimit,
    search: regSearch,
    setSearch: setRegSearch,
    filters: regFilters,
    setFilter: setRegFilter,
    clearFilters: clearRegFilters,
    activeCount: regActiveCount,
    queryParams: regQueryParams,
  } = useListFilters({ fields: regFilterFields, searchDebounceMs: 400 });

  const paginatedRegParams = useMemo(
    () => ({ ...regQueryParams, eventId }),
    [regQueryParams, eventId],
  );

  const {
    registrations: apiPaginatedRegistrations,
    meta: regMeta,
    isLoading: isPaginatedRegLoading,
    isError: isPaginatedRegError,
    error: paginatedRegError,
    refetch: refetchPaginatedRegs,
  } = useRegistrations(paginatedRegParams);

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
      <div className="space-y-6 animate-fade-in pb-10">
        <PageHeader
          title="Event details"
          breadcrumbs={[eventsCrumb, { label: "Event" }]}
        />
        {isEventsLoading ? (
          <SkeletonCardGrid count={4} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface">
            {isEventsError ? (
              <ErrorState
                resource="this event"
                error={eventsError}
                onRetry={() => refetchEvents()}
              />
            ) : (
              <EmptyState
                icon={CalendarX}
                title="Event not found."
                description="It may have been deleted, or the link is incorrect."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={() => router.push("/events")}
                  >
                    Back to events
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
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
  const hasRegFilters = Boolean(regSearch) || regActiveCount > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title={selectedEvent.name}
        breadcrumbs={[eventsCrumb, { label: selectedEvent.name }]}
        description={
          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <Badge color={categoryColor} size="sm">
              {selectedEvent.category}
            </Badge>
            {selectedEvent.isFeatured && (
              <Badge color="gold" size="sm" className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                FEATURED
              </Badge>
            )}
            <StatusBadge status={selectedEvent.status} size="sm" />
            {selectedEvent.requiresRegistration ? (
              <span className="flex items-center gap-1 text-primary-text font-semibold">
                <Ticket className="w-3 h-3" /> Registration Required
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success-text font-semibold">
                <DoorOpen className="w-3 h-3" /> Open Admission
              </span>
            )}
            <span aria-hidden="true">•</span>
            <span>
              {new Date(selectedEvent.startDate).toLocaleDateString()}
            </span>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              leftIcon={<Edit className="w-3.5 h-3.5 text-warning" />}
              onClick={() => setIsEditing(true)}
            >
              Edit Event
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-danger-border bg-danger-soft text-danger-text hover:bg-danger-soft hover:border-danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete Event
            </Button>
          </>
        }
      />

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
              loading={isPaginatedRegLoading}
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
              loading={isTeamsLoading || isLoadingLeaderboard}
            />
            <StatsCard
              title="Games Tournament"
              value={`${games.length} Contests`}
              change={`${completedGames} games completed`}
              trend="up"
              icon={Gamepad2}
              color="amber"
              loading={isLoadingGames}
            />
          </StatsCardGroup>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              {selectedEvent.imageUrl && (
                <div className="relative w-full h-48 bg-muted overflow-hidden border-b border-border-subtle">
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
              <CardContent className="space-y-3 text-xs text-fg-secondary">
                <div className="p-3 rounded-xl bg-subtle space-y-1.5">
                  <p className="font-semibold text-fg">Location:</p>
                  <p className="text-fg-muted">
                    {selectedEvent.location || "Main Sanctuary"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-subtle space-y-1.5">
                  <p className="font-semibold text-fg">Event Dates:</p>
                  <p className="text-fg-muted">
                    {new Date(selectedEvent.startDate).toLocaleString()} –{" "}
                    {new Date(selectedEvent.endDate).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-subtle space-y-1.5">
                  <p className="font-semibold text-fg">Admission Type:</p>
                  <p className="text-fg-muted">
                    {selectedEvent.requiresRegistration
                      ? `Registration Required (Capacity: ${selectedEvent.capacity ?? "Unlimited"})`
                      : "Open Admission (No pre-registration required)"}
                  </p>
                </div>

                {/* Program Highlights */}
                {selectedEvent.highlights &&
                  selectedEvent.highlights.length > 0 && (
                    <div className="p-3 rounded-xl bg-warning-soft space-y-2">
                      <p className="font-bold text-warning-text flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-warning" />
                        Program Highlights:
                      </p>
                      <ul className="space-y-1 pl-1">
                        {selectedEvent.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="text-xs text-fg-secondary flex items-start gap-1.5"
                          >
                            <span className="text-warning font-bold">•</span>
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
                <div className="p-4 rounded-xl border border-border bg-subtle text-xs">
                  <p className="font-bold text-fg mb-1">Team Auto-Balancing</p>
                  <p className="text-fg-muted">
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
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-fg-secondary">
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
                  onChange={(e) => setRegSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <div>
                <Select
                  aria-label={regStatusField.label}
                  value={regFilters.status ?? ""}
                  onChange={(e) => setRegFilter("status", e.target.value)}
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
              isLoading={isPaginatedRegLoading}
              isError={isPaginatedRegError}
              error={paginatedRegError}
              onRetry={() => refetchPaginatedRegs()}
              resource="registrations"
              isEmpty={paginatedRegistrations.length === 0}
              loading={<SkeletonList rows={Math.min(regLimit, 6)} />}
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
                          setRegSearch("");
                          clearRegFilters();
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
                {paginatedRegistrations.map((r) => (
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
                        <TeamBadge color={r.team.colorHex}>
                          {r.team.name}
                        </TeamBadge>
                      )}
                      <StatusBadge status={r.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                className="pt-3 border-t border-border-subtle"
                page={regPage}
                totalPages={regMeta?.totalPages ?? 1}
                totalItems={regMeta?.total ?? paginatedRegistrations.length}
                pageSize={regLimit}
                onPageChange={setRegPage}
                onPageSizeChange={setRegLimit}
                pageSizeOptions={REG_PAGE_SIZES}
              />
            </QueryState>
          </CardContent>
        </Card>
      )}

      {/* Tab Content 3: Teams & Roster (Collapsible Teams with Member Rosters) */}
      {activeTab === "teams" && (
        <TeamRostersTab
          teams={enrichedTeams}
          teamRosterMap={teamRosterMap}
          unassignedRoster={unassignedRoster}
          totalAttendees={allRegistrations.length}
          isLoading={isTeamsLoading || isRosterLoading || isLoadingLeaderboard}
          isError={isTeamsError || isRosterError}
          onRetry={() => {
            if (isTeamsError) refetchTeams();
            if (isRosterError) refetchRoster();
          }}
        />
      )}

      {/* Tab Content 4: Games */}
      {activeTab === "games" && (
        <QueryState
          isLoading={isLoadingGames}
          isError={isGamesError}
          error={gamesError}
          onRetry={() => refetchGames()}
          isEmpty={games.length === 0}
          resource="games"
          loading={
            <div className="rounded-2xl border border-border bg-surface p-4">
              <SkeletonList rows={3} />
            </div>
          }
          empty={
            <div className="rounded-2xl border border-border bg-surface">
              <EmptyState
                icon={Gamepad2}
                title="No games yet"
                description="Games created for this event will be listed here."
              />
            </div>
          }
        >
          <div className="space-y-3">
            {games.map((g, idx) => (
              <Card key={g.id}>
                <CardContent className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-fg">{g.name}</h4>
                    <p className="text-fg-subtle">
                      Max Score: {g.maxScore} pts
                    </p>
                  </div>
                  <span className="font-mono text-xs text-primary-text font-bold">
                    Game #{idx + 1}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </QueryState>
      )}

      {isEditing && (
        <SidebarModal
          title="Edit Event"
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
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
