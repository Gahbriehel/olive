import { Team } from "@/models/team";

export type GameStatus = "Upcoming" | "In Progress" | "Completed";

export interface Game {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  maxScore: number;
  status?: GameStatus;
  winnerTeamId?: string;
  scores: { teamId: string; teamName: string; points: number }[];
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
  captain: string;
}

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
  name: string;
  description?: string;
  maxScore?: number;
  scores?: IApiScore[];
  createdAt?: string;
}

export interface ICreateGamePayload {
  eventId: string;
  name: string;
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

export type IGame = Game;

export function adaptApiGameToGame(apiGame: IApiGame, teams?: Team[]): Game {
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
          const team = teams?.find((t) => t.id === s.teamId || t.id === s.team);
          return {
            teamId: (s.teamId as string) || (s.team as string) || "",
            teamName: (s.teamName as string) || (team ? team.name : "Team"),
            points: (s.points as number) ?? (s.score as number) ?? 0,
          };
        })
      : [],
  };
}

// Backwards compatibility aliases
export type ApiGame = IApiGame;
export type CreateGameDto = ICreateGamePayload;
export type UpdateGameDto = IUpdateGamePayload;
export type RecordScoreDto = IRecordScorePayload;
