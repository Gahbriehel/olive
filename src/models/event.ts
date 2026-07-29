import { ChurchEvent } from "@/types/dashboard";

export type ApiEventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

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

export interface IChurchEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  registeredCount: number;
  checkedInCount: number;
  status: "Upcoming" | "Live" | "Completed";
}

// Adapters
export function adaptApiEventToChurchEvent(apiEvent: IApiEvent): ChurchEvent {
  const now = new Date();
  const start = new Date(apiEvent.startDate);
  const end = new Date(apiEvent.endDate);

  let status: "Upcoming" | "Live" | "Completed" = "Upcoming";
  if (apiEvent.status === "COMPLETED" || now > end) {
    status = "Completed";
  } else if (now >= start && now <= end) {
    status = "Live";
  }

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
    status,
    registrationDeadline: apiEvent.startDate,
    teamAssignmentEnabled: true,
  };
}

// Backwards compatibility aliases
export type ApiEvent = IApiEvent;
export type CreateEventDto = ICreateEventPayload;
export type UpdateEventDto = IUpdateEventPayload;
