import { apiClient } from "@/utils/api-client";
import {
  IPersonResponse,
  IPersonPayload,
  IUpdatePersonPayload,
  IPromotePersonPayload,
  IPeopleStats,
  IRelative,
  IAddRelativePayload,
} from "@/models/person";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
  extractMeta,
  extractStats,
} from "@/models/base";

export const peopleService = {
  async getPeople(params?: IQueryParams): Promise<{
    people: IPersonResponse[];
    meta?: IBaseResponse["meta"];
    stats?: IPeopleStats;
  }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/people", {
      params,
    });
    return {
      people: extractArray<IPersonResponse>(res.data),
      meta: extractMeta(res.data),
      stats: extractStats<IPeopleStats>(res.data),
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

  async promotePerson(
    id: string,
    payload: IPromotePersonPayload,
  ): Promise<IPersonResponse> {
    const res = await apiClient.post<
      IBaseResponse<IPersonResponse> | IPersonResponse
    >(`/people/${id}/promote`, payload);
    return extractData<IPersonResponse>(res.data);
  },

  async getRelatives(id: string): Promise<IRelative[]> {
    const res = await apiClient.get<IBaseResponse<unknown>>(
      `/people/${id}/relatives`,
    );
    return extractArray<IRelative>(res.data);
  },

  async addRelative(
    id: string,
    payload: IAddRelativePayload,
  ): Promise<IRelative> {
    const res = await apiClient.post<IBaseResponse<IRelative> | IRelative>(
      `/people/${id}/relatives`,
      payload,
    );
    return extractData<IRelative>(res.data);
  },

  async removeRelative(id: string, relationshipId: string): Promise<void> {
    await apiClient.delete(`/people/${id}/relatives/${relationshipId}`);
  },

  async deletePerson(id: string): Promise<void> {
    await apiClient.delete(`/people/${id}`);
  },
};
