"use client";

import React, { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useDashboard } from "@/context/DashboardContext";
import { useEvents } from "@/hooks/useEvents";
import { TeamRostersTab } from "../_components/TeamRostersTab";
import { EditEventPanel } from "../_components/EditEventPanel";
import { EventDetailMeta } from "../_components/EventDetailMeta";
import { EventGamesTab } from "../_components/EventGamesTab";
import { EventNotFound } from "../_components/EventNotFound";
import { EventOverviewTab } from "../_components/EventOverviewTab";
import { EventRegistrationsTab } from "../_components/EventRegistrationsTab";
import { useEventDetailData } from "../_components/useEventDetailData";

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

  const {
    teams: teamsData,
    games: gamesData,
    roster,
    registrations,
  } = useEventDetailData(eventId);
  const { enrichedTeams } = teamsData;
  const { games } = gamesData;
  const { allRegistrations } = roster;

  const selectedEvent = events.find((e) => e.id === eventId) || events[0];

  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "registrations",
      label: "Registrations",
      count: registrations.meta?.total ?? allRegistrations.length,
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
      <EventNotFound
        isLoading={isEventsLoading}
        isError={isEventsError}
        error={eventsError}
        onRetry={() => refetchEvents()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title={selectedEvent.name}
        breadcrumbs={[eventsCrumb, { label: selectedEvent.name }]}
        description={<EventDetailMeta event={selectedEvent} />}
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

      {activeTab === "overview" && (
        <EventOverviewTab
          event={selectedEvent}
          totalRegistrations={
            registrations.meta?.total ?? allRegistrations.length
          }
          registrationsLoading={registrations.isLoading}
          teamCount={enrichedTeams.length}
          teamsLoading={teamsData.isLoading || gamesData.isLoadingLeaderboard}
          gameCount={games.length}
          completedGames={games.filter((g) => g.status === "Completed").length}
          gamesLoading={gamesData.isLoading}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {activeTab === "registrations" && (
        <EventRegistrationsTab
          data={registrations}
          fallbackTotal={allRegistrations.length}
        />
      )}

      {/* Teams & Roster (Collapsible Teams with Member Rosters) */}
      {activeTab === "teams" && (
        <TeamRostersTab
          teams={enrichedTeams}
          teamRosterMap={roster.teamRosterMap}
          unassignedRoster={roster.unassignedRoster}
          totalAttendees={allRegistrations.length}
          isLoading={
            teamsData.isLoading ||
            roster.isLoading ||
            gamesData.isLoadingLeaderboard
          }
          isError={teamsData.isError || roster.isError}
          onRetry={() => {
            if (teamsData.isError) teamsData.refetch();
            if (roster.isError) roster.refetch();
          }}
        />
      )}

      {activeTab === "games" && <EventGamesTab data={gamesData} />}

      {isEditing && (
        <EditEventPanel
          event={selectedEvent}
          onClose={() => setIsEditing(false)}
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
