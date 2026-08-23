"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";
import { PublicLeaderboardView } from "@/components/public-leaderboard-view";

export default function EventLeaderboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  const { data: event } = useQuery({
    queryKey: ["eventDetail", eventId],
    queryFn: () => webService.getEventById(eventId),
    enabled: Boolean(eventId),
  });

  return <PublicLeaderboardView eventId={eventId} event={event} />;
}
