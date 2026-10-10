"use client";

import {
  ArrowUpRight,
  Clock,
  DoorOpen,
  MapPin,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionsList, type ActionItem } from "@/components/ui/ActionsList";
import { cn } from "@/helpers/cn";
import { getCategoryColor, type IChurchEvent } from "@/models/event";

const statusStyles: Record<string, { card: string; progress: string }> = {
  PUBLISHED: {
    card: "border-t-4 border-t-success bg-surface hover:border-success/50",
    progress: "bg-success",
  },
  DRAFT: {
    card: "border-t-4 border-t-warning bg-surface hover:border-warning/50",
    progress: "bg-warning",
  },
  COMPLETED: {
    card: "border-t-4 border-t-primary bg-surface opacity-90 hover:opacity-100 hover:border-primary/50",
    progress: "bg-primary",
  },
  CANCELLED: {
    card: "border-t-4 border-t-danger bg-surface opacity-75 hover:opacity-100 hover:border-danger/50",
    progress: "bg-danger",
  },
};

const fallbackStyle = {
  card: "border-t-4 border-t-border-control bg-surface",
  progress: "bg-fg-subtle",
};

interface EventCardProps {
  event: IChurchEvent;
  actions: ActionItem[];
  onOpen: (path: string) => void;
}

export function EventCard({ event: evt, actions, onOpen }: EventCardProps) {
  const statusStyle = statusStyles[evt.status] ?? fallbackStyle;
  const categoryColor = getCategoryColor(evt.category);
  const capPct = evt.capacity
    ? Math.round((evt.registeredCount / Math.max(evt.capacity, 1)) * 100)
    : 0;
  const detailsPath = `/events/${evt.id}`;

  return (
    <Card
      className={cn(
        "transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg overflow-hidden group",
        statusStyle.card,
      )}
    >
      <div>
        {evt.imageUrl && (
          <div
            onClick={() => onOpen(detailsPath)}
            className="relative w-full h-36 bg-muted overflow-hidden border-b border-border-subtle cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evt.imageUrl}
              alt={evt.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                status={evt.status}
                dot={evt.status === "CANCELLED" ? false : undefined}
              />
              <Badge color={categoryColor} size="sm">
                {evt.category}
              </Badge>
              {evt.isFeatured && (
                <Badge
                  color="gold"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                  FEATURED
                </Badge>
              )}
            </div>
            <CardTitle
              onClick={() => onOpen(detailsPath)}
              className="text-base font-bold text-fg hover:text-primary-text cursor-pointer transition-colors"
            >
              {evt.name}
            </CardTitle>
          </div>

          <ActionsList actions={actions} />
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
            {evt.description || "No description provided."}
          </p>

          {evt.highlights && evt.highlights.length > 0 && (
            <div className="space-y-1">
              <p className="text-2xs font-semibold text-fg-subtle flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-warning" />
                Highlights
              </p>
              <div className="flex flex-wrap gap-1">
                {evt.highlights.slice(0, 3).map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-muted text-2xs text-fg-secondary"
                  >
                    • {h}
                  </span>
                ))}
                {evt.highlights.length > 3 && (
                  <span className="text-2xs text-fg-subtle self-center">
                    +{evt.highlights.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs text-fg-secondary bg-subtle p-2.5 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate font-medium">
                {evt.location || "Sanctuary"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-warning shrink-0" />
              <span className="font-medium">
                Schedule: {new Date(evt.startDate).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-subtle border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg-secondary flex items-center gap-1.5">
                {evt.requiresRegistration ? (
                  <>
                    <Ticket className="w-3.5 h-3.5 text-primary" />
                    Registration Required
                  </>
                ) : (
                  <>
                    <DoorOpen className="w-3.5 h-3.5 text-success" />
                    Open Admission
                  </>
                )}
              </span>
              <span className="font-mono text-xs font-semibold text-fg-muted">
                {evt.requiresRegistration
                  ? `${evt.registeredCount}/${evt.capacity ?? "∞"}`
                  : "Open"}
              </span>
            </div>
            {evt.requiresRegistration && evt.capacity && (
              <div className="w-full h-1.5 bg-muted-strong rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    statusStyle.progress,
                  )}
                  style={{ width: `${Math.min(capPct, 100)}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-2 border-t border-border-subtle flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 text-primary-text"
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          onClick={() => onOpen(detailsPath)}
        >
          View Event Details
        </Button>
        {evt.requiresRegistration && (
          <Button
            variant="ghost"
            size="sm"
            className="-mr-3"
            leftIcon={<Users className="w-3.5 h-3.5 text-info" />}
            onClick={() => onOpen(`${detailsPath}?tab=teams`)}
          >
            View Teams
          </Button>
        )}
      </div>
    </Card>
  );
}
