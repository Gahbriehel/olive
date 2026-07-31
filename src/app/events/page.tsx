"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useEvents } from "@/hooks/useEvents";
import { adaptApiEventToChurchEvent } from "@/models/event";
import { EventsView } from "@/components/views/EventsView";

export default function EventsPage() {
  const router = useRouter();
  const { setIsCreateEventOpen } = useDashboard();
  const { events: apiEvents } = useEvents();

  const events = React.useMemo(
    () =>
      Array.isArray(apiEvents) ? apiEvents.map(adaptApiEventToChurchEvent) : [],
    [apiEvents],
  );

  return (
    <EventsView
      events={events}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onSelectEvent={(evt) => router.push(`/events/${evt.id}`)}
    />
  );
}
