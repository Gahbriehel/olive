import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { CreateOrUpdateEventPayload, EventCategory } from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";

interface EditEventPanelProps {
  event: IChurchEvent;
  onClose: () => void;
  onSubmit: (data: CreateOrUpdateEventPayload) => Promise<void>;
  onDelete: () => Promise<void>;
}

/** Side panel with the event form, pre-filled from a list/detail event. */
export function EditEventPanel({
  event,
  onClose,
  onSubmit,
  onDelete,
}: EditEventPanelProps) {
  return (
    <SidebarModal title="Edit Event" isOpen={Boolean(event)} onClose={onClose}>
      <EventsForm
        initialValues={{
          id: event.id,
          title: event.name,
          category: event.category as EventCategory,
          description: event.description,
          location: event.location,
          capacity: event.capacity,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          imageUrl: event.imageUrl || undefined,
          googleCalendarSync: event.googleCalendarSync,
          requiresRegistration: event.requiresRegistration,
          highlights: event.highlights || undefined,
          isFeatured: event.isFeatured,
        }}
        onCancel={onClose}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />
    </SidebarModal>
  );
}
