import { apiClient } from "@/utils/api-client";
import {
  IApiEvent,
  ICreateEventPayload,
  IUpdateEventPayload,
} from "@/models/event";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const eventsService = {
  async getEvents(params?: IQueryParams): Promise<IApiEvent[]> {
    const res = await apiClient.get<IBaseResponse<IApiEvent[]> | IApiEvent[]>(
      "/events",
      { params },
    );
    return extractArray<IApiEvent>(res.data);
  },

  async getEventById(id: string): Promise<IApiEvent> {
    const res = await apiClient.get<IBaseResponse<IApiEvent> | IApiEvent>(
      `/events/${id}`,
    );
    return extractData<IApiEvent>(res.data);
  },

  async createEvent(payload: ICreateEventPayload): Promise<IApiEvent> {
    const res = await apiClient.post<IBaseResponse<IApiEvent> | IApiEvent>(
      "/events",
      payload,
    );
    return extractData<IApiEvent>(res.data);
  },

  async updateEvent(
    id: string,
    payload: IUpdateEventPayload,
  ): Promise<IApiEvent> {
    const res = await apiClient.patch<IBaseResponse<IApiEvent> | IApiEvent>(
      `/events/${id}`,
      payload,
    );
    return extractData<IApiEvent>(res.data);
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<IBaseResponse<{ success: boolean }>>(
      `/events/${id}`,
    );
    return extractData<{ success: boolean }>(res.data) || { success: true };
  },
};
