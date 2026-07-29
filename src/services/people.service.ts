import { apiClient } from "@/utils/api-client";
import {
  IApiPerson,
  ICreatePersonPayload,
  IUpdatePersonPayload,
} from "@/models/person";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const peopleService = {
  async getPeople(params?: IQueryParams): Promise<IApiPerson[]> {
    const res = await apiClient.get<IBaseResponse<IApiPerson[]> | IApiPerson[]>(
      "/people",
      { params },
    );
    return extractArray<IApiPerson>(res.data);
  },

  async getPersonById(id: string): Promise<IApiPerson> {
    const res = await apiClient.get<IBaseResponse<IApiPerson> | IApiPerson>(
      `/people/${id}`,
    );
    return extractData<IApiPerson>(res.data);
  },

  async createPerson(payload: ICreatePersonPayload): Promise<IApiPerson> {
    const res = await apiClient.post<IBaseResponse<IApiPerson> | IApiPerson>(
      "/people",
      payload,
    );
    return extractData<IApiPerson>(res.data);
  },

  async updatePerson(
    id: string,
    payload: IUpdatePersonPayload,
  ): Promise<IApiPerson> {
    const res = await apiClient.patch<IBaseResponse<IApiPerson> | IApiPerson>(
      `/people/${id}`,
      payload,
    );
    return extractData<IApiPerson>(res.data);
  },
};
