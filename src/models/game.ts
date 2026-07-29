import { Game } from "@/types/dashboard";

export interface IApiScore {
  id: string;
  gameId: string;
  teamId: string;
  points: number;
  recordedBy?: string;
  createdAt?: string;
}

export interface IApiGame {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  maxScore?: number;
  scores?: IApiScore[];
  createdAt?: string;
}

export interface ICreateGamePayload {
  eventId: string;
  title: string;
  description?: string;
  maxScore?: number;
}

export type IUpdateGamePayload = Partial<ICreateGamePayload>;

export interface IRecordScorePayload {
  gameId: string;
  teamId: string;
  points: number;
}

export interface ILeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  colorHex: string;
  totalScore: number;
}

export interface IGameScore {
  teamId: string;
  teamName: string;
  points: number;
}

export interface IGame {
  id: string;
  roundNumber: number;
  title: string;
  type: string;
  description: string;
  maxPoints: number;
  status: "Scheduled" | "In-Progress" | "Completed";
  scores: IGameScore[];
}

export function adaptApiGameToGame(
  apiGame: IApiGame,
  orderIndex: number = 1,
): Game {
  return {
    id: apiGame.id,
    title: apiGame.title,
    category: "Tournament Activity",
    maxPoints: apiGame.maxScore || 100,
    order: orderIndex,
    status:
      apiGame.scores && apiGame.scores.length > 0 ? "Completed" : "Upcoming",
    scores: (apiGame.scores || []).map((s) => ({
      teamId: s.teamId,
      teamName: "Team",
      points: s.points,
    })),
  };
}

// Backwards compatibility aliases
export type ApiGame = IApiGame;
export type CreateGameDto = ICreateGamePayload;
export type UpdateGameDto = IUpdateGamePayload;
export type RecordScoreDto = IRecordScorePayload;
