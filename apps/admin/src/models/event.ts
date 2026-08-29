export type EventStatus = "CANCELLED" | "PUBLISHED" | "COMPLETED" | "DRAFT";
export type ApiEventStatus = EventStatus;

export interface IChurchEvent {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  games?: number;
  teams?: number;
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export interface IEventResponse {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity?: number;
  status: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  createdAt?: string;
  updatedAt?: string;
  checkedInCount?: number;
  registeredCount?: number;
  games?: number;
  teams?: number;
}

export interface IEventPayload {
  churchId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity?: number;
  status?: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export type IUpdateEventPayload = Partial<IEventPayload>;

// Adapters
export function adaptApiEventToChurchEvent(
  apiEvent: IEventResponse,
): IChurchEvent {
  return {
    id: apiEvent.id,
    name: apiEvent.title,
    category: "General",
    description: apiEvent.description || "",
    startDate: apiEvent.startDate,
    endDate: apiEvent.endDate,
    location: apiEvent.location || "N/A",
    capacity: apiEvent.capacity || 500,
    registeredCount: apiEvent.registeredCount ?? 0,
    checkedInCount: apiEvent.checkedInCount ?? 0,
    games: apiEvent.games ?? 0,
    teams: apiEvent.teams ?? 0,
    status: apiEvent.status || "DRAFT",
    registrationDeadline: apiEvent.startDate,
    teamAssignmentEnabled: true,
    imageUrl: apiEvent.imageUrl,
    googleCalendarSync: apiEvent.googleCalendarSync ?? false,
  };
}

// Backwards compatibility aliases
export type ChurchEvent = IChurchEvent;
export type IChurchEventAlias = IChurchEvent;
export type IApiEvent = IEventResponse;
export type ApiEvent = IEventResponse;
export type ICreateEventPayload = IEventPayload;
export type CreateEventDto = IEventPayload;
export type UpdateEventDto = IUpdateEventPayload;
