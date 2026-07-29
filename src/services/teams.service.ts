import { apiClient } from "@/utils/api-client";
import {
  IApiTeam,
  ICreateTeamPayload,
  IUpdateTeamPayload,
} from "@/models/team";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const teamsService = {
  async getTeams(eventId?: string, params?: IQueryParams): Promise<IApiTeam[]> {
    const res = await apiClient.get<IBaseResponse<IApiTeam[]> | IApiTeam[]>(
      "/teams",
      { params: { ...params, eventId } },
    );
    return extractArray<IApiTeam>(res.data);
  },

  async createTeam(payload: ICreateTeamPayload): Promise<IApiTeam> {
    const res = await apiClient.post<IBaseResponse<IApiTeam> | IApiTeam>(
      "/teams",
      payload,
    );
    return extractData<IApiTeam>(res.data);
  },

  async updateTeam(id: string, payload: IUpdateTeamPayload): Promise<IApiTeam> {
    const res = await apiClient.patch<IBaseResponse<IApiTeam> | IApiTeam>(
      `/teams/${id}`,
      payload,
    );
    return extractData<IApiTeam>(res.data);
  },
};
