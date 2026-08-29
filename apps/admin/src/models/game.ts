import { ITeam } from "@/models/team";

export type GameStatus = "Upcoming" | "In Progress" | "Completed";

export interface IGame {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  maxScore: number;
  status?: GameStatus;
  winnerTeamId?: string;
  scores: {
    id?: string;
    teamId: string;
    teamName: string;
    teamColor?: string;
    points: number;
    notes?: string;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  colorHex: string;
  totalPoints: number;
  gamesPlayed: number;
  rankChange: "up" | "down" | "same";
  captain?: string;
}

export interface IGameScoreResponse {
  id: string;
  gameId: string;
  teamId: string;
  points: number;
  notes?: string | null;
  recordedBy?: string;
  createdAt?: string;
  team?: {
    id: string;
    name: string;
    color?: string | null;
  };
}

export interface IGameResponse {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  maxScore?: number;
  scores?: IGameScoreResponse[];
  createdAt?: string;
}

export interface IGamePayload {
  eventId: string;
  name: string;
  description?: string;
  maxScore?: number;
}

export type IUpdateGamePayload = Partial<IGamePayload>;

export interface IRecordScorePayload {
  gameId: string;
  teamId: string;
  points: number;
  notes?: string;
}

export interface IUpdateScorePayload {
  gameId?: string;
  teamId?: string;
  points?: number;
  notes?: string;
}

export interface ILeaderboardEntry {
  rank?: number;
  teamId: string;
  teamName: string;
  color?: string;
  colorHex?: string;
  totalScore?: number;
  totalPoints?: number;
  memberCount?: number;
  gamesPlayed?: number;
}

export interface IGameScore {
  teamId: string;
  teamName: string;
  points: number;
}

export function adaptApiGameToGame(
  apiGame: IGameResponse,
  teams?: ITeam[],
): IGame {
  if (!apiGame) {
    return {
      id: "",
      eventId: "",
      name: "Untitled Game",
      maxScore: 100,
      status: "Upcoming",
      scores: [],
    };
  }

  const rawGame = apiGame as unknown as Record<string, unknown>;
  const name = apiGame.name || (rawGame.title as string) || "Untitled Game";
  const maxScore = apiGame.maxScore ?? (rawGame.maxPoints as number) ?? 100;
  const rawScores =
    apiGame.scores ||
    (rawGame.gameScores as Array<Record<string, unknown>>) ||
    [];

  return {
    id: apiGame.id || (rawGame._id as string) || "",
    eventId: apiGame.eventId || (rawGame.event_id as string) || "",
    name,
    description: apiGame.description || (rawGame.desc as string) || "",
    maxScore,
    status:
      (rawGame.status as GameStatus) ||
      (rawScores.length > 0 ? "Completed" : "Upcoming"),
    scores: Array.isArray(rawScores)
      ? rawScores.map((rawS: unknown) => {
          const s = rawS as Record<string, unknown>;
          const teamObj = s.team as Record<string, unknown> | undefined;
          const teamId =
            (s.teamId as string) ||
            (teamObj?.id as string) ||
            (typeof s.team === "string" ? s.team : "") ||
            "";
          const team = teams?.find((t) => t.id === teamId);
          return {
            id: (s.id as string) || (s._id as string) || undefined,
            teamId,
            teamName:
              (s.teamName as string) ||
              (teamObj?.name as string) ||
              (team ? team.name : "Team"),
            teamColor:
              (teamObj?.color as string) || (team ? team.color : undefined),
            points: (s.points as number) ?? (s.score as number) ?? 0,
            notes: (s.notes as string) || undefined,
          };
        })
      : [],
  };
}

// Backwards compatibility aliases
export type Game = IGame;
export type IApiGame = IGameResponse;
export type ApiGame = IGameResponse;
export type ICreateGamePayload = IGamePayload;
export type CreateGameDto = IGamePayload;
export type UpdateGameDto = IUpdateGamePayload;
export type RecordScoreDto = IRecordScorePayload;
