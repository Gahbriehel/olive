export interface ITeam {
  id: string;
  eventId: string;
  name: string;
  color: string;
  colorHex: string;
  totalPoints: number;
  memberCount?: number;
  captain?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeamResponse {
  id: string;
  eventId: string;
  name: string;
  color?: string;
  colorHex?: string;
  totalScore?: number;
  totalPoints?: number;
  memberCount?: number;
  captain?: string;
  createdAt?: string;
  updatedAt?: string;
  event?: {
    id: string;
    title?: string;
    name?: string;
  };
}

export interface ITeamPayload {
  eventId: string;
  name: string;
  color?: string;
  colorHex?: string;
}

export type IUpdateTeamPayload = Partial<ITeamPayload>;

export function adaptApiTeamToTeam(apiTeam: ITeamResponse): ITeam {
  const rawColor = apiTeam.color || apiTeam.colorHex || "#6366F1";
  const colorHex = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
  const rawTeam = apiTeam as unknown as Record<string, unknown>;

  return {
    id: apiTeam.id,
    eventId: apiTeam.eventId || "",
    name: apiTeam.name,
    color: apiTeam.name.toLowerCase().replace(/\s+/g, "-"),
    colorHex,
    totalPoints: apiTeam.totalScore ?? apiTeam.totalPoints ?? 0,
    memberCount:
      apiTeam.memberCount ??
      (rawTeam.memberCount as number) ??
      ((rawTeam._count as Record<string, unknown>)?.members as number) ??
      undefined,
    captain: apiTeam.captain || (rawTeam.captain as string) || undefined,
    createdAt: apiTeam.createdAt,
    updatedAt: apiTeam.updatedAt,
  };
}
