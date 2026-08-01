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
    location: apiEvent.location || "Main Sanctuary",
    capacity: 500,
    registeredCount: 0,
    checkedInCount: 0,
    status: apiEvent.status || "DRAFT",
    registrationDeadline: apiEvent.startDate,
    teamAssignmentEnabled: true,
  };
}

// Backwards compatibility aliases
export type ApiEvent = IApiEvent;
export type CreateEventDto = ICreateEventPayload;
export type UpdateEventDto = IUpdateEventPayload;
