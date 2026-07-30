import React from "react";
import {
  Phone,
  ArrowRightLeft,
  Sparkles,
  Shield,
  Users,
  Trophy,
  Scale,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/ui/StatsCard";
import { Team, Registration } from "@/types/dashboard";

interface TeamsViewProps {
  teams: Team[];
  registrations: Registration[];
  onReassignTeam: (registrationId: string, newTeamId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  registrations,
  onReassignTeam,
}) => {
  const totalTeams = teams.length;
  const totalAllocated = registrations.length;
  const highestPointsTeam = teams.reduce(
    (max, t) => (t.totalPoints > max.totalPoints ? t : max),
    teams[0] || { name: "N/A", totalPoints: 0 },
  );
  const avgTeamSize =
    totalTeams > 0 ? (totalAllocated / totalTeams).toFixed(1) : 0;

  const handleQuickMove = (regId: string, currentTeamId: string) => {
    const teamIds = teams.map((t) => t.id);
    const currIdx = teamIds.indexOf(currentTeamId);
    const nextTeamId = teamIds[(currIdx + 1) % teamIds.length];
    onReassignTeam(regId, nextTeamId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Event Teams & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Four balanced conference teams competing in tournament games. Move
            attendees between teams to balance rosters.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
            Auto-Balanced Roster Active
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Teams"
          value={totalTeams.toLocaleString()}
          change="Tournament divisions"
          trend="neutral"
          icon={Shield}
          color="indigo"
        />
        <StatsCard
          title="Allocated Members"
          value={totalAllocated.toLocaleString()}
          change="Assigned to teams"
          trend="up"
          icon={Users}
          color="emerald"
        />
        <StatsCard
          title="Leader Team"
          value={highestPointsTeam.name}
          change={`${highestPointsTeam.totalPoints} total points`}
          trend="up"
          icon={Trophy}
          color="amber"
        />
        <StatsCard
          title="Average Team Size"
          value={`${avgTeamSize} members`}
          change="Balanced target"
          trend="neutral"
          icon={Scale}
          color="cyan"
        />
      </div>

      {/* 4 Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => {
          const teamRegs = registrations.filter(
            (r) => r.assignedTeamId === team.id,
          );
          return (
            <Card
              key={team.id}
              className="relative overflow-hidden border-t-4"
              style={{ borderTopColor: team.colorHex }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: team.colorHex }}
                  >
                    {team.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {team.totalPoints} pts
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {team.memberCount}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      Members
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Captain:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {team.captain}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {team.captainPhone}
                  </p>
                </div>

                {/* Member Preview List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Roster Sample (Click ⇄ to move)
                  </p>
                  {teamRegs.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                        {r.name}
                      </span>
                      <button
                        onClick={() => handleQuickMove(r.id, team.id)}
                        className="px-2 py-1 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded text-[10px] font-mono hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors flex items-center gap-1"
                        title="Move to Next Team"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Move
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Drag & Reassign Roster Control */}
      <Card>
        <CardHeader>
          <CardTitle>Roster Reassignment Console</CardTitle>
          <CardDescription>
            Click any registered attendee to transfer them to another team
            immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex items-center justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {r.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {r.registrationNumber}
                  </p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold text-white"
                    style={{ backgroundColor: r.assignedTeamColor }}
                  >
                    {r.assignedTeamName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMove(r.id, r.assignedTeamId)}
                  className="text-[11px] h-8"
                >
                  Transfer ⇄
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
