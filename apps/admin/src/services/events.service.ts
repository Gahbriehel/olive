import { apiClient } from "@/utils/api-client";
import {
  IEventResponse,
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

export const eventsService = {
  async getEvents(
    params?: IQueryParams,
  ): Promise<{ events: IEventResponse[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/events", {
      params,
    });
    return {
      events: extractArray<IEventResponse>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async getEventById(id: string): Promise<IEventResponse> {
    const res = await apiClient.get<
      IBaseResponse<IEventResponse> | IEventResponse
    >(`/events/${id}`);
    return extractData<IEventResponse>(res.data);
  },

  async createEvent(payload: IEventPayload): Promise<IEventResponse> {
    const res = await apiClient.post<
      IBaseResponse<IEventResponse> | IEventResponse
    >("/events", payload);
    return extractData<IEventResponse>(res.data);
  },

  async updateEvent(
    id: string,
    payload: IUpdateEventPayload,
  ): Promise<IEventResponse> {
    const res = await apiClient.patch<
      IBaseResponse<IEventResponse> | IEventResponse
    >(`/events/${id}`, payload);
    return extractData<IEventResponse>(res.data);
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete<IBaseResponse<{ success: boolean }>>(
      `/events/${id}`,
    );
    return extractData<{ success: boolean }>(res.data) || { success: true };
  },
};
