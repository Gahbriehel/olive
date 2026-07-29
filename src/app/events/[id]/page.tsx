"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { EventDetailView } from "@/components/views/EventDetailView";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { events, registrations, teams, games, setIsQrScannerOpen } =
    useDashboard();

  const selectedEvent = events.find((e) => e.id === eventId) || events[0];

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
