"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiGameToGame } from "@/models/game";
import { EventDetailView } from "@/components/views/EventDetailView";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { events, setIsQrScannerOpen } = useDashboard();
  const regParams = React.useMemo(() => ({ eventId }), [eventId]);
  const { registrations: apiRegistrations } = useRegistrations(regParams);
  const { teams: apiTeams } = useTeams(eventId);
  const { games: apiGames } = useGames(eventId);

  const selectedEvent = events.find((e) => e.id === eventId) || events[0];

  const registrations = React.useMemo(
    () =>
      Array.isArray(apiRegistrations)
        ? apiRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiRegistrations],
  );

  const teams = React.useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const games = React.useMemo(
    () =>
      Array.isArray(apiGames)
        ? apiGames.map((g, idx) => adaptApiGameToGame(g, idx + 1))
        : [],
    [apiGames],
  );

  return (
    <EventDetailView
      event={selectedEvent}
      registrations={registrations}
      teams={teams}
      games={games}
      onBack={() => router.push("/events")}
      onOpenQrScanner={() => setIsQrScannerOpen(true)}
    />
  );
}
