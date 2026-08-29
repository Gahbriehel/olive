import { apiClient } from "@/utils/api-client";
import {
  IRegistrationResponse,
  IRegistrationPayload,
} from "@/models/registration";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
  extractMeta,
} from "@/models/base";

export const registrationsService = {
  async getRegistrations(params?: IQueryParams): Promise<{
    registrations: IRegistrationResponse[];
    meta?: IBaseResponse["meta"];
  }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/registrations", {
      params,
    });
    return {
      registrations: extractArray<IRegistrationResponse>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async registerAttendee(
    eventId: string,
    payload: IRegistrationPayload,
  ): Promise<IRegistrationResponse> {
    const res = await apiClient.post<
      IBaseResponse<IRegistrationResponse> | IRegistrationResponse
    >(`/events/${eventId}/register`, payload);
    return extractData<IRegistrationResponse>(res.data);
  },

  async getRegistrationById(id: string): Promise<IRegistrationResponse> {
    const res = await apiClient.get<
      IBaseResponse<IRegistrationResponse> | IRegistrationResponse
    >(`/registrations/${id}`);
    return extractData<IRegistrationResponse>(res.data);
  },
};
