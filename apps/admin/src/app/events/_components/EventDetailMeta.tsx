import { DoorOpen, Star, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCategoryColor } from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";

/** Badge line rendered as the event detail page header description. */
export function EventDetailMeta({ event }: { event: IChurchEvent }) {
  return (
    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
      <Badge color={getCategoryColor(event.category)} size="sm">
        {event.category}
      </Badge>
      {event.isFeatured && (
        <Badge color="gold" size="sm" className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          FEATURED
        </Badge>
      )}
      <StatusBadge status={event.status} size="sm" />
      {event.requiresRegistration ? (
        <span className="flex items-center gap-1 text-primary-text font-semibold">
          <Ticket className="w-3 h-3" /> Registration Required
        </span>
      ) : (
        <span className="flex items-center gap-1 text-success-text font-semibold">
          <DoorOpen className="w-3 h-3" /> Open Admission
        </span>
      )}
      <span aria-hidden="true">•</span>
      <span>{new Date(event.startDate).toLocaleDateString()}</span>
    </span>
  );
}
