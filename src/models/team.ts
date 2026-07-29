import { Team } from "@/types/dashboard";

export interface IApiTeam {
  id: string;
  eventId: string;
  name: string;
  colorHex?: string;
  capacity?: number;
  totalScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateTeamPayload {
  eventId: string;
  name: string;
  colorHex?: string;
  capacity?: number;
}

export type IUpdateTeamPayload = Partial<ICreateTeamPayload>;

export interface ITeam {
  id: string;
  name: string;
  colorHex: string;
  memberCount: number;
  capacity: number;
  leaderName: string;
  totalPoints: number;
}

export function adaptApiTeamToTeam(apiTeam: IApiTeam): Team {
  return {
    id: apiTeam.id,
    name: apiTeam.name,
    color: apiTeam.name.toLowerCase().replace(/\s+/g, "-"),
    colorHex: apiTeam.colorHex || "#6366F1",
    memberCount: 0,
    totalPoints: apiTeam.totalScore || 0,
    captain: "Team Captain",
    captainPhone: "+1 (555) 019-2834",
    badgeIcon: "Shield",
  };
}

// Backwards compatibility aliases
export type ApiTeam = IApiTeam;
export type CreateTeamDto = ICreateTeamPayload;
export type UpdateTeamDto = IUpdateTeamPayload;
