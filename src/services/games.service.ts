import { apiClient } from "@/utils/api-client";
import {
  IApiGame,
  ICreateGamePayload,
  IRecordScorePayload,
  IApiScore,
  ILeaderboardEntry,
} from "@/models/game";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const gamesService = {
  async getGames(eventId?: string, params?: IQueryParams): Promise<IApiGame[]> {
    const res = await apiClient.get<IBaseResponse<IApiGame[]> | IApiGame[]>(
      "/games",
      { params: { ...params, eventId } },
    );
    return extractArray<IApiGame>(res.data);
  },

  async createGame(payload: ICreateGamePayload): Promise<IApiGame> {
    const res = await apiClient.post<IBaseResponse<IApiGame> | IApiGame>(
      "/games",
      payload,
    );
    return extractData<IApiGame>(res.data);
  },

  async recordScore(payload: IRecordScorePayload): Promise<IApiScore> {
    const res = await apiClient.post<IBaseResponse<IApiScore> | IApiScore>(
      "/scores",
      payload,
    );
    return extractData<IApiScore>(res.data);
  },

  async getLeaderboard(eventId: string): Promise<ILeaderboardEntry[]> {
    const res = await apiClient.get<
      IBaseResponse<ILeaderboardEntry[]> | ILeaderboardEntry[]
    >(`/games/event/${eventId}/leaderboard`);
    return extractArray<ILeaderboardEntry>(res.data);
  },
};
