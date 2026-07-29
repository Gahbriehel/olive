import { apiClient } from "@/utils/api-client";
import { IApiRegistration, IRegisterPayload } from "@/models/registration";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const registrationsService = {
  async getRegistrations(params?: IQueryParams): Promise<IApiRegistration[]> {
    const res = await apiClient.get<
      IBaseResponse<IApiRegistration[]> | IApiRegistration[]
    >("/registrations", { params });
    return extractArray<IApiRegistration>(res.data);
  },

  async registerAttendee(
    eventId: string,
    payload: IRegisterPayload,
  ): Promise<IApiRegistration> {
    const res = await apiClient.post<
      IBaseResponse<IApiRegistration> | IApiRegistration
    >(`/events/${eventId}/register`, payload);
    return extractData<IApiRegistration>(res.data);
  },

  async getRegistrationById(id: string): Promise<IApiRegistration> {
    const res = await apiClient.get<
      IBaseResponse<IApiRegistration> | IApiRegistration
    >(`/registrations/${id}`);
    return extractData<IApiRegistration>(res.data);
  },
};
