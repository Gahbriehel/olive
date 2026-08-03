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
  extractMeta,
} from "@/models/base";

export const eventsService = {
  async getEvents(
    params?: IQueryParams,
  ): Promise<{ events: IApiEvent[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/events", {
      params,
    });
    return {
      events: extractArray<IApiEvent>(res.data),
      meta: extractMeta(res.data),
    };
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
