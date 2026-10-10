import { Calendar, DoorOpen, Radio, Ticket, Users } from "lucide-react";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { IChurchEvent } from "@/types/dashboard";

interface EventsStatsProps {
  events: IChurchEvent[];
  total?: number;
  loading: boolean;
}

export function EventsStats({ events, total, loading }: EventsStatsProps) {
  const totalEvents = total ?? events.length;
  // No aggregate endpoint yet: these breakdowns only cover the loaded page.
  const statsArePartial = totalEvents > events.length;
  const partialNote = statsArePartial ? "Current page only" : undefined;
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const ticketedEvents = events.filter((e) => e.requiresRegistration).length;
  const openServices = events.filter((e) => !e.requiresRegistration).length;
  const totalRegistrations = events.reduce(
    (sum, e) => sum + e.registeredCount,
    0,
  );

  return (
    <StatsCardGroup>
      <StatsCard
        title="Total Events"
        value={totalEvents.toLocaleString()}
        change="All platform events"
        trend="neutral"
        icon={Calendar}
        color="indigo"
        loading={loading}
      />
      <StatsCard
        title="Published Events"
        value={publishedEvents.toLocaleString()}
        change="Live & visible"
        trend="up"
        icon={Radio}
        color="emerald"
        description={partialNote}
        loading={loading}
      />
      <StatsCard
        title="Ticketed Events"
        value={ticketedEvents.toLocaleString()}
        change="Registration required"
        trend="neutral"
        icon={Ticket}
        color="cyan"
        description={partialNote}
        loading={loading}
      />
      <StatsCard
        title="Open Admission"
        value={openServices.toLocaleString()}
        change="Open church services"
        trend="neutral"
        icon={DoorOpen}
        color="amber"
        description={partialNote}
        loading={loading}
      />
      <StatsCard
        title="Total Registered"
        value={totalRegistrations.toLocaleString()}
        change="Confirmed attendees"
        trend="up"
        icon={Users}
        color="indigo"
        description={partialNote}
        loading={loading}
      />
    </StatsCardGroup>
  );
}
