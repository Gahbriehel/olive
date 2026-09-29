import { apiClient } from "@/utils/api-client";
import {
  AdminEvent,
  CreateOrUpdateEventPayload,
  EventStatus,
  EventCategory,
  IEventPayload,
  IUpdateEventPayload,
} from "@/models/event";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
  extractMeta,
} from "@/models/base";

export interface AdminEventFilters {
  page?: number;
  limit?: number;
  status?: EventStatus;
  category?: EventCategory;
  requiresRegistration?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export const fetchAdminEvents = async (filters?: AdminEventFilters) => {
  const response = await apiClient.get<{
    items: AdminEvent[];
    meta: IBaseResponse["meta"];
  }>("/events", { params: filters });
  return response.data;
};

export const eventsService = {
  fetchAdminEvents,

  async getEvents(
    params?: AdminEventFilters | IQueryParams,
  ): Promise<{ events: AdminEvent[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/events", {
      params,
    });
    return {
      events: extractArray<AdminEvent>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async getEventById(id: string): Promise<AdminEvent> {
    const res = await apiClient.get<IBaseResponse<AdminEvent> | AdminEvent>(
      `/events/${id}`,
    );
    return extractData<AdminEvent>(res.data);
  },

  async createEvent(
    payload: CreateOrUpdateEventPayload | IEventPayload,
  ): Promise<AdminEvent> {
    const res = await apiClient.post<IBaseResponse<AdminEvent> | AdminEvent>(
      "/events",
      payload,
    );
    return extractData<AdminEvent>(res.data);
  },

  async updateEvent(
    id: string,
    payload: Partial<CreateOrUpdateEventPayload> | IUpdateEventPayload,
  ): Promise<AdminEvent> {
    const res = await apiClient.patch<IBaseResponse<AdminEvent> | AdminEvent>(
      `/events/${id}`,
      payload,
    );
    return extractData<AdminEvent>(res.data);
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<IBaseResponse<{ success: boolean }>>(
      `/events/${id}`,
    );
    return extractData<{ success: boolean }>(res.data) || { success: true };
  },
};
