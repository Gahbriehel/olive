"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, Shield, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { TeamBadge } from "@/components/ui/TeamBadge";
import {
  EmptyState,
  QueryState,
  SkeletonList,
} from "@/components/ui/QueryState";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn } from "@/helpers/cn";
import { type ITeam } from "@/models/team";
import { type IRegistration } from "@/models/registration";
import { RosterTable } from "./RosterTable";

interface TeamRostersTabProps {
  teams: ITeam[];
  teamRosterMap: Map<string, IRegistration[]>;
  unassignedRoster: IRegistration[];
  totalAttendees: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const chipBase =
  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer";

function matchesSearch(m: IRegistration, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    m.registrationNumber.toLowerCase().includes(q)
  );
}

/** Teams & Roster tab: collapsible team cards, each with its attendee roster. */
export function TeamRostersTab({
  teams,
  teamRosterMap,
  unassignedRoster,
  totalAttendees,
  isLoading,
  isError,
  onRetry,
}: TeamRostersTabProps) {
  const [teamRosterFilter, setTeamRosterFilter] = useState<string>("ALL");
  const [rosterSearch, setRosterSearch] = useState<string>("");
  const debouncedRosterSearch = useDebouncedSearch(rosterSearch, 300);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  // Memoised so each roster table keeps its page between unrelated re-renders.
  const filteredRosters = useMemo(() => {
    const result = new Map<string, IRegistration[]>();
    for (const [teamId, members] of teamRosterMap) {
      result.set(
        teamId,
        members.filter((m) => matchesSearch(m, debouncedRosterSearch)),
      );
    }
    return result;
  }, [teamRosterMap, debouncedRosterSearch]);

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeams((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const isAllExpanded =
    teams.length > 0 && teams.every((t) => expandedTeams[t.id]);

  const handleToggleAllTeams = () => {
    if (isAllExpanded) {
      setExpandedTeams({});
    } else {
      const allExpanded: Record<string, boolean> = { UNASSIGNED: true };
      teams.forEach((t) => {
        allExpanded[t.id] = true;
      });
      setExpandedTeams(allExpanded);
    }
  };

  const isUnassignedExpanded = Boolean(expandedTeams["UNASSIGNED"]);

  return (
    <div className="space-y-6">
      {/* Header & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-fg">
              House Teams & Attendee Rosters
            </h2>
            <p className="text-xs text-fg-muted">
              Complete event roster ({totalAttendees} total attendees). Click
              any team card below to expand its roster.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search roster by name, email, or reg #..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* Quick Team Filter Chips & Expand All Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={teamRosterFilter === "ALL"}
              onClick={() => setTeamRosterFilter("ALL")}
              className={cn(
                chipBase,
                teamRosterFilter === "ALL"
                  ? "bg-fg text-surface shadow-xs"
                  : "bg-muted text-fg-secondary hover:bg-muted-strong",
              )}
            >
              All Teams ({totalAttendees})
            </button>
            {teams.map((t) => {
              const count = (teamRosterMap.get(t.id) || []).length;
              const isSelected = teamRosterFilter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setTeamRosterFilter(t.id);
                    // Auto-expand the filtered team
                    setExpandedTeams((prev) => ({ ...prev, [t.id]: true }));
                  }}
                  className={cn(
                    chipBase,
                    isSelected
                      ? "text-white shadow-xs"
                      : "bg-muted text-fg-secondary hover:bg-muted-strong",
                  )}
                  style={{
                    backgroundColor: isSelected ? t.colorHex : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? "#ffffff" : t.colorHex,
                    }}
                  />
                  <span>{t.name}</span>
                  <span className="opacity-80">({count})</span>
                </button>
              );
            })}
            {unassignedRoster.length > 0 && (
              <button
                type="button"
                aria-pressed={teamRosterFilter === "UNASSIGNED"}
                onClick={() => {
                  setTeamRosterFilter("UNASSIGNED");
                  setExpandedTeams((prev) => ({ ...prev, UNASSIGNED: true }));
                }}
                className={cn(
                  chipBase,
                  teamRosterFilter === "UNASSIGNED"
                    ? "bg-warning text-white shadow-xs"
                    : "bg-warning-soft text-warning-text",
                )}
              >
                Unassigned ({unassignedRoster.length})
              </button>
            )}
          </div>

          {teams.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-text"
              onClick={handleToggleAllTeams}
            >
              {isAllExpanded ? "Collapse All Rosters" : "Expand All Rosters"}
            </Button>
          )}
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        resource="teams and rosters"
        isEmpty={teams.length === 0 && unassignedRoster.length === 0}
        loading={
          <div className="rounded-2xl border border-border bg-surface p-4">
            <SkeletonList rows={4} />
          </div>
        }
        empty={
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Shield}
              title="No teams or attendees yet"
              description="Teams and their rosters appear here once attendees register for this event."
            />
          </div>
        }
      >
        <div className="space-y-4">
          {teams
            .filter(
              (t) => teamRosterFilter === "ALL" || teamRosterFilter === t.id,
            )
            .map((t, idx) => {
              const members = filteredRosters.get(t.id) || [];
              const checkedInCount = members.filter(
                (m) => m.status === "Checked-In",
              ).length;
              const isExpanded = Boolean(expandedTeams[t.id]);

              return (
                <Card key={t.id} className="overflow-hidden shadow-xs">
                  {/* Collapsible Team Header Bar */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleTeamExpanded(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleTeamExpanded(t.id);
                      }
                    }}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-subtle transition-colors select-none"
                    style={{ borderLeft: `4px solid ${t.colorHex}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-muted font-bold text-xs flex items-center justify-center text-fg-secondary shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-fg">
                            {t.name}
                          </h3>
                          <TeamBadge color={t.colorHex}>Team Roster</TeamBadge>
                        </div>
                        <p className="text-xs text-fg-muted">
                          {members.length} Assigned Member
                          {members.length === 1 ? "" : "s"} • {checkedInCount}{" "}
                          Checked In
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-subtle font-mono text-fg-secondary">
                        Score:{" "}
                        <strong className="text-sm font-bold text-fg">
                          {t.totalPoints} pts
                        </strong>
                      </div>
                      <div className="flex items-center gap-1 text-fg-subtle hover:text-fg-secondary transition-colors">
                        <span className="text-2xs font-medium hidden sm:inline">
                          {isExpanded ? "Hide Roster" : "View Roster"}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded && "rotate-180 text-primary",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-4 border-t border-border-subtle animate-fade-in">
                      {members.length === 0 ? (
                        <EmptyState
                          icon={User}
                          className="py-8"
                          title={
                            debouncedRosterSearch
                              ? `No members found matching "${debouncedRosterSearch}" on this team.`
                              : "No attendees currently assigned to this team."
                          }
                        />
                      ) : (
                        <RosterTable members={members} />
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}

          {/* Unassigned Roster (Collapsible) */}
          {(teamRosterFilter === "ALL" || teamRosterFilter === "UNASSIGNED") &&
            unassignedRoster.length > 0 && (
              <Card className="overflow-hidden border-warning-border shadow-xs">
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isUnassignedExpanded}
                  onClick={() => toggleTeamExpanded("UNASSIGNED")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTeamExpanded("UNASSIGNED");
                    }
                  }}
                  className="p-4 bg-warning-soft border-b border-warning-border flex items-center justify-between cursor-pointer select-none"
                >
                  <div>
                    <h3 className="text-sm font-bold text-warning-text flex items-center gap-2">
                      <User className="w-4 h-4 text-warning" />
                      Unassigned Registrants Roster
                    </h3>
                    <p className="text-xs text-fg-muted">
                      Attendees registered without team placement (
                      {unassignedRoster.length})
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-warning-text text-xs">
                    <span className="text-2xs font-medium hidden sm:inline">
                      {isUnassignedExpanded ? "Hide Roster" : "View Roster"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isUnassignedExpanded && "rotate-180",
                      )}
                    />
                  </div>
                </div>
                {isUnassignedExpanded && (
                  <CardContent className="p-4 animate-fade-in">
                    <RosterTable members={unassignedRoster} />
                  </CardContent>
                )}
              </Card>
            )}
        </div>
      </QueryState>
    </div>
  );
}
