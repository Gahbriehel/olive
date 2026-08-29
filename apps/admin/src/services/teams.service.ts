import { apiClient } from "@/utils/api-client";
import { ITeamResponse, ITeamPayload, IUpdateTeamPayload } from "@/models/team";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const teamsService = {
  async getTeams(
    params?: IQueryParams,
  ): Promise<{ teams: ITeamResponse[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/teams", {
      params,
    });
    const responseData = res.data;
    const teams = extractArray<ITeamResponse>(responseData);

    let meta: IBaseResponse["meta"] = undefined;
    if (
      responseData &&
      typeof responseData === "object" &&
      responseData !== null
    ) {
      const respObj = responseData as unknown as Record<string, unknown>;
      if ("meta" in respObj && respObj.meta) {
        meta = respObj.meta as IBaseResponse["meta"];
      } else if (
        "data" in respObj &&
        respObj.data &&
        typeof respObj.data === "object" &&
        "meta" in (respObj.data as Record<string, unknown>)
      ) {
        meta = (respObj.data as Record<string, unknown>)
          .meta as IBaseResponse["meta"];
      }
    }

    return { teams, meta };
  },

  async createTeam(payload: ITeamPayload): Promise<ITeamResponse> {
    const res = await apiClient.post<
      IBaseResponse<ITeamResponse> | ITeamResponse
    >("/teams", payload);
    return extractData<ITeamResponse>(res.data);
  },

  async updateTeam(
    id: string,
    payload: IUpdateTeamPayload,
  ): Promise<ITeamResponse> {
    const res = await apiClient.patch<
      IBaseResponse<ITeamResponse> | ITeamResponse
    >(`/teams/${id}`, payload);
    return extractData<ITeamResponse>(res.data);
  },

  async deleteTeam(id: string): Promise<void> {
    await apiClient.delete(`/teams/${id}`);
  },
};
