import { apiClient } from "@/utils/api-client";
import {
  IPersonResponse,
  IPersonPayload,
  IUpdatePersonPayload,
} from "@/models/person";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
  extractMeta,
} from "@/models/base";

export const peopleService = {
  async getPeople(
    params?: IQueryParams,
  ): Promise<{ people: IPersonResponse[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/people", {
      params,
    });
    return {
      people: extractArray<IPersonResponse>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async getPersonById(id: string): Promise<IPersonResponse> {
    const res = await apiClient.get<
      IBaseResponse<IPersonResponse> | IPersonResponse
    >(`/people/${id}`);
    return extractData<IPersonResponse>(res.data);
  },

  async createPerson(payload: IPersonPayload): Promise<IPersonResponse> {
    const res = await apiClient.post<
      IBaseResponse<IPersonResponse> | IPersonResponse
    >("/people", payload);
    return extractData<IPersonResponse>(res.data);
  },

  async updatePerson(
    id: string,
    payload: IUpdatePersonPayload,
  ): Promise<IPersonResponse> {
    const res = await apiClient.patch<
      IBaseResponse<IPersonResponse> | IPersonResponse
    >(`/people/${id}`, payload);
    return extractData<IPersonResponse>(res.data);
  },
};
