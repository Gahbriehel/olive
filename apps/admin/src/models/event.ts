export type EventStatus = "CANCELLED" | "PUBLISHED" | "COMPLETED" | "DRAFT";
export type ApiEventStatus = EventStatus;

export interface ChurchEvent {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export interface IApiEvent {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateEventPayload {
  churchId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status?: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export type IUpdateEventPayload = Partial<ICreateEventPayload>;

export type IChurchEvent = ChurchEvent;

// Adapters
export function adaptApiEventToChurchEvent(apiEvent: IApiEvent): ChurchEvent {
  return {
    id: apiEvent.id,
    name: apiEvent.title,
    category: "General",
    description: apiEvent.description || "",
    startDate: apiEvent.startDate,
    endDate: apiEvent.endDate,
    location: apiEvent.location || "N/A",
    capacity: 500,
    registeredCount: 0,
    checkedInCount: 0,
    status: apiEvent.status || "DRAFT",
    registrationDeadline: apiEvent.startDate,
    teamAssignmentEnabled: true,
    imageUrl: apiEvent.imageUrl,
    googleCalendarSync: apiEvent.googleCalendarSync ?? false,
  };
}

// Backwards compatibility aliases
export type ApiEvent = IApiEvent;
export type CreateEventDto = ICreateEventPayload;
export type UpdateEventDto = IUpdateEventPayload;
