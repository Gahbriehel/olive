import { useMemo } from "react";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiGameToGame } from "@/models/game";

export const regStatusField = {
  type: "select",
  key: "status",
  label: "Status",
  allLabel: "All Statuses",
  options: [
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Checked-In", value: "CHECKED_IN" },
    { label: "Cancelled", value: "CANCELLED" },
  ],
} satisfies FilterField;

const regFilterFields: FilterField[] = [regStatusField];

/**
 * All the per-event queries the event detail page needs (teams, games,
 * leaderboard, full roster, paginated registrations) plus the derived
 * team/roster groupings.
 */
export function useEventDetailData(eventId: string) {
  // Teams Query: Fetch all teams for this event (limit: 100)
  const teamsParams = useMemo(() => ({ eventId, limit: 100 }), [eventId]);
  const {
    teams: apiTeams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useTeams(teamsParams);

  // Games & Leaderboard Query
  const gamesParams = useMemo(() => ({ eventId }), [eventId]);
  const {
    games: apiGames,
    leaderboard,
    isLoadingGames,
    isLoadingLeaderboard,
    isError: isGamesError,
    error: gamesError,
    refetchGames,
  } = useGames(gamesParams);

  // Full Roster Query (limit: 1000): Complete attendee pool for team roster mapping
  const fullRosterParams = useMemo(
    () => ({ eventId, limit: 1000, page: 1 }),
    [eventId],
  );
  const {
    registrations: apiAllRegistrations,
    isLoading: isRosterLoading,
    isError: isRosterError,
    refetch: refetchRoster,
  } = useRegistrations(fullRosterParams);

  // Paginated Registrations Query (for the dedicated Registrations tab)
  const regList = useListFilters({
    fields: regFilterFields,
    searchDebounceMs: 400,
  });
  const { queryParams: regQueryParams } = regList;

  const paginatedRegParams = useMemo(
    () => ({ ...regQueryParams, eventId }),
    [regQueryParams, eventId],
  );

  const {
    registrations: apiPaginatedRegistrations,
    meta: regMeta,
    isLoading: isPaginatedRegLoading,
    isError: isPaginatedRegError,
    error: paginatedRegError,
    refetch: refetchPaginatedRegs,
  } = useRegistrations(paginatedRegParams);

  const allRegistrations = useMemo(
    () =>
      Array.isArray(apiAllRegistrations)
        ? apiAllRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiAllRegistrations],
  );

  const paginatedRegistrations = useMemo(
    () =>
      Array.isArray(apiPaginatedRegistrations)
        ? apiPaginatedRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiPaginatedRegistrations],
  );

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const games = useMemo(
    () =>
      Array.isArray(apiGames)
        ? apiGames.map((g) => adaptApiGameToGame(g, teams))
        : [],
    [apiGames, teams],
  );

  const enrichedTeams = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return teams;

    const lbMap = new Map(leaderboard.map((lb) => [lb.teamId, lb]));

    const merged = teams.map((t) => {
      const lbEntry = lbMap.get(t.id);
      if (!lbEntry) return t;
      const rawColor = lbEntry.colorHex || lbEntry.color || t.colorHex;
      const colorHex = rawColor.startsWith("#") ? rawColor : `#${rawColor}`;
      return {
        ...t,
        totalPoints: lbEntry.totalScore ?? lbEntry.totalPoints ?? t.totalPoints,
        memberCount: lbEntry.memberCount ?? t.memberCount,
        colorHex,
      };
    });

    return merged.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [teams, leaderboard]);

  // Group all attendees into teams from the full roster
  const { teamRosterMap, unassignedRoster } = useMemo(() => {
    const map = new Map<string, typeof allRegistrations>();
    for (const team of enrichedTeams) {
      map.set(team.id, []);
    }
    const unassigned: typeof allRegistrations = [];

    for (const reg of allRegistrations) {
      const teamId = reg.assignedTeamId || reg.team?.id;
      if (teamId && map.has(teamId)) {
        map.get(teamId)!.push(reg);
      } else {
        const matchingTeam = enrichedTeams.find(
          (t) =>
            t.name.toLowerCase() === reg.team?.name?.toLowerCase() ||
            t.id === reg.assignedTeamId,
        );
        if (matchingTeam && map.has(matchingTeam.id)) {
          map.get(matchingTeam.id)!.push(reg);
        } else {
          unassigned.push(reg);
        }
      }
    }

    return { teamRosterMap: map, unassignedRoster: unassigned };
  }, [enrichedTeams, allRegistrations]);

  return {
    teams: {
      enrichedTeams,
      isLoading: isTeamsLoading,
      isError: isTeamsError,
      refetch: refetchTeams,
    },
    games: {
      games,
      isLoading: isLoadingGames,
      isLoadingLeaderboard,
      isError: isGamesError,
      error: gamesError,
      refetch: refetchGames,
    },
    roster: {
      allRegistrations,
      teamRosterMap,
      unassignedRoster,
      isLoading: isRosterLoading,
      isError: isRosterError,
      refetch: refetchRoster,
    },
    registrations: {
      list: regList,
      registrations: paginatedRegistrations,
      meta: regMeta,
      isLoading: isPaginatedRegLoading,
      isError: isPaginatedRegError,
      error: paginatedRegError,
      refetch: refetchPaginatedRegs,
    },
  };
}

export type EventDetailData = ReturnType<typeof useEventDetailData>;
