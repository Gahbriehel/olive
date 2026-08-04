import { apiClient } from "@/utils/api-client";
import {
  IApiGame,
  ICreateGamePayload,
  IRecordScorePayload,
  IApiScore,
  ILeaderboardEntry,
  IUpdateGamePayload,
  IUpdateScorePayload,
} from "@/models/game";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
} from "@/models/base";

export const gamesService = {
  async getGames(
    params?: IQueryParams,
  ): Promise<{ games: IApiGame[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/games", {
      params,
    });
    const responseData = res.data;

    const games = extractArray<IApiGame>(responseData);

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

    return { games, meta };
  },

  async createGame(payload: ICreateGamePayload): Promise<IApiGame> {
    const res = await apiClient.post<IBaseResponse<IApiGame> | IApiGame>(
      "/games",
      payload,
    );
    return extractData<IApiGame>(res.data);
  },

  async updateGame(id: string, payload: IUpdateGamePayload): Promise<IApiGame> {
    const res = await apiClient.patch<IBaseResponse<IApiGame> | IApiGame>(
      `/games/${id}`,
      payload,
    );
    return extractData<IApiGame>(res.data);
  },

  async deleteGame(id: string): Promise<void> {
    await apiClient.delete(`/games/${id}`);
  },

  async recordScore(payload: IRecordScorePayload): Promise<IApiScore> {
    const res = await apiClient.post<IBaseResponse<IApiScore> | IApiScore>(
      "/scores",
      payload,
    );
    return extractData<IApiScore>(res.data);
  },

  async updateScore(
    id: string,
    payload: IUpdateScorePayload,
  ): Promise<IApiScore> {
    const res = await apiClient.patch<IBaseResponse<IApiScore> | IApiScore>(
      `/scores/${id}`,
      payload,
    );
    return extractData<IApiScore>(res.data);
  },

  async clearGameScores(gameId: string): Promise<void> {
    await apiClient.delete(`/scores/game/${gameId}`);
  },

  async getLeaderboard(eventId: string): Promise<ILeaderboardEntry[]> {
    const res = await apiClient.get<unknown>(`/leaderboard/${eventId}`);
    const rawData = res.data as Record<string, unknown> | null;
    let lbObj = rawData;

    if (
      rawData &&
      typeof rawData === "object" &&
      "data" in rawData &&
      rawData.data
    ) {
      lbObj = rawData.data as Record<string, unknown>;
    }

    if (
      lbObj &&
      typeof lbObj === "object" &&
      "leaderboard" in lbObj &&
      Array.isArray(lbObj.leaderboard)
    ) {
      return lbObj.leaderboard as ILeaderboardEntry[];
    }

    return extractArray<ILeaderboardEntry>(res.data);
  },
};
