"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/QueryState";
import { IUpcomingEvent } from "@/models/dashboard";
import { getCategoryColor, EventCategory } from "@/models/event";

interface UpcomingEventsCardProps {
  events?: IUpcomingEvent[];
  isLoading?: boolean;
  className?: string;
}

export const UpcomingEventsCard: React.FC<UpcomingEventsCardProps> = ({
  events = [],
  isLoading = false,
  className,
}) => {
  const router = useRouter();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-soft text-primary-text">
            <CalendarDays className="w-4 h-4" />
          </div>
          <CardTitle>Upcoming Events</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/events")}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Manage
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border bg-subtle space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-36" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            className="py-8"
          />
        ) : (
          events.map((event) => {
            const categoryColor = getCategoryColor(
              event.category as EventCategory,
            );
            return (
              <button
                key={event.id}
                type="button"
                className="event-card block w-full text-left p-3 rounded-xl border border-border bg-subtle hover:bg-muted transition-all cursor-pointer space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <span className="flex items-center justify-between flex-wrap gap-1">
                  <span className="category-pill">
                    <Badge color={categoryColor} size="sm">
                      {event.category || "GENERAL"}
                    </Badge>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {event.isFeatured && (
                      <span className="featured-star text-warning-text font-semibold text-2xs flex items-center gap-0.5">
                        ★ Pinned on Website
                      </span>
                    )}
                    <Badge variant="slate" size="sm">
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </span>
                </span>
                <span className="block text-xs font-bold text-fg">
                  {event.title}
                </span>
                <span className="block text-2xs text-fg-muted">
                  {event.requiresRegistration !== false
                    ? `Registrations: ${event.totalRegistrations ?? 0}`
                    : "Open Admission"}
                </span>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsCard;
