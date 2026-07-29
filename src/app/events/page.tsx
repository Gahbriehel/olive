"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { EventsView } from "@/components/views/EventsView";

export default function EventsPage() {
  const router = useRouter();
  const { events, setIsCreateEventOpen } = useDashboard();

  return (
    <EventsView
      events={events}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onSelectEvent={(evt) => router.push(`/events/${evt.id}`)}
    />
  );
}
