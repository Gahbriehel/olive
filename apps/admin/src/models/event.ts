export type EventCategory =
  | "GENERAL"
  | "CONFERENCE"
  | "VIGIL"
  | "COMMUNION"
  | "REVIVAL"
  | "WORSHIP"
  | "OUTREACH";

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
export type ApiEventStatus = EventStatus;

export interface AdminEvent {
  id: string;
  churchId: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  location?: string | null;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: EventStatus;
  imageUrl?: string | null;
  googleCalendarSync: boolean;
  capacity?: number | null;
  requiresRegistration: boolean;
  highlights?: string[] | null;
  isFeatured: boolean;
  registeredCount: number;
  checkedInCount: number;
  teams: number;
  games: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateEventPayload {
  title: string;
  description?: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  status?: EventStatus;
  location?: string;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  requiresRegistration: boolean;
  capacity?: number | null;
  highlights?: string[];
  isFeatured?: boolean;
}

export interface IChurchEvent {
  id: string;
  churchId?: string;
  name: string;
  title?: string;
  category: EventCategory | string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number | null;
  registeredCount: number;
  checkedInCount: number;
  games?: number;
  teams?: number;
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
  imageUrl?: string | null;
  googleCalendarSync?: boolean;
  requiresRegistration: boolean;
  highlights?: string[] | null;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Category color mapping
export function getCategoryColor(
  category?: EventCategory | string | null,
):
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "cyan"
  | "purple"
  | "blue"
  | "gold" {
  if (!category) return "slate";
  const cat = category.toUpperCase();
  switch (cat) {
    case "CONFERENCE":
      return "purple";
    case "VIGIL":
      return "indigo";
    case "COMMUNION":
      return "rose";
    case "REVIVAL":
      return "amber";
    case "WORSHIP":
      return "cyan";
    case "OUTREACH":
      return "emerald";
    case "GENERAL":
    default:
      return "slate";
  }
}

// Adapters
export function adaptApiEventToChurchEvent(
  apiEvent: AdminEvent | (Partial<AdminEvent> & { id: string; title?: string }),
): IChurchEvent {
  const category = (apiEvent.category as EventCategory) || "GENERAL";
  const title = apiEvent.title || "Untitled Event";
  return {
    id: apiEvent.id,
    churchId: apiEvent.churchId,
    name: title,
    title: title,
    category,
    description: apiEvent.description || "",
    startDate: apiEvent.startDate || new Date().toISOString(),
    endDate: apiEvent.endDate || new Date().toISOString(),
    location: apiEvent.location || "N/A",
    capacity: apiEvent.capacity !== undefined ? apiEvent.capacity : null,
    registeredCount: apiEvent.registeredCount ?? 0,
    checkedInCount: apiEvent.checkedInCount ?? 0,
    games: apiEvent.games ?? 0,
    teams: apiEvent.teams ?? 0,
    status: (apiEvent.status as EventStatus) || "DRAFT",
    registrationDeadline: apiEvent.startDate || new Date().toISOString(),
    teamAssignmentEnabled: true,
    imageUrl: apiEvent.imageUrl,
    googleCalendarSync: apiEvent.googleCalendarSync ?? false,
    requiresRegistration: apiEvent.requiresRegistration ?? true,
    highlights: apiEvent.highlights ? [...apiEvent.highlights] : [],
    isFeatured: apiEvent.isFeatured ?? false,
    createdAt: apiEvent.createdAt,
    updatedAt: apiEvent.updatedAt,
  };
}

// Backwards compatibility aliases
export type IEventResponse = AdminEvent;
export type IEventPayload = CreateOrUpdateEventPayload;
export type IUpdateEventPayload = Partial<CreateOrUpdateEventPayload>;
export type ChurchEvent = IChurchEvent;
export type IChurchEventAlias = IChurchEvent;
export type IApiEvent = AdminEvent;
export type ApiEvent = AdminEvent;
export type ICreateEventPayload = CreateOrUpdateEventPayload;
export type CreateEventDto = CreateOrUpdateEventPayload;
export type UpdateEventDto = Partial<CreateOrUpdateEventPayload>;
