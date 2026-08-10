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
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [page, limit, search],
  );

  const { events: apiEvents, meta, refetch } = useEvents(queryParams);

  const events = React.useMemo(
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

  return (
    <EventsView
      events={events}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onSelectEvent={(evt) => router.push(`/events/${evt.id}`)}
      meta={meta}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      search={search}
      onSearchChange={handleSearchChange}
      onRefetch={refetch}
    />
  );
}
