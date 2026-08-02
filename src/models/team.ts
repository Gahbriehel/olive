export interface Team {
  id: string;
  eventId: string;
  name: string;
  color: string;
  colorHex: string;
  totalPoints: number;
  createdAt?: string;
  updatedAt?: string;
  captain?: string;
  captainPhone?: string;
  memberCount?: number;
  badgeIcon?: string;
}

export interface IApiTeam {
  id: string;
  eventId: string;
  name: string;
  color?: string;
  colorHex?: string;
  totalScore?: number;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
  event?: {
    id: string;
    title?: string;
    name?: string;
  };
}

export interface ICreateTeamPayload {
  eventId: string;
  name: string;
  color?: string;
  colorHex?: string;
}

export interface IUpdateTeamPayload {
  id?: string;
  eventId?: string;
  name?: string;
  color?: string;
  colorHex?: string;
}

export type ITeam = Team;

export function adaptApiTeamToTeam(apiTeam: IApiTeam): Team {
  const rawColor = apiTeam.color || apiTeam.colorHex || "#6366F1";
  const colorHex = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;

  return {
    id: apiTeam.id,
    eventId: apiTeam.eventId || "",
    name: apiTeam.name,
    color: apiTeam.name.toLowerCase().replace(/\s+/g, "-"),
    colorHex,
    totalPoints: apiTeam.totalScore ?? apiTeam.totalPoints ?? 0,
    createdAt: apiTeam.createdAt,
    updatedAt: apiTeam.updatedAt,
    memberCount: 0,
    captain: "Team Lead",
    captainPhone: "",
    badgeIcon: "Shield",
  };
}

// Backwards compatibility aliases
export type ApiTeam = IApiTeam;
export type CreateTeamDto = ICreateTeamPayload;
export type UpdateTeamDto = IUpdateTeamPayload;
