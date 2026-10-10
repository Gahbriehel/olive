"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ActionsList } from "@/components/ui/ActionsList";
import { ITeam } from "@/models/team";
import { IRegistration } from "@/types/dashboard";

interface TeamCardProps {
  team: ITeam;
  /** Registrations assigned to this team. */
  members: IRegistration[];
  onEdit: () => void;
  onDelete: () => void;
}

export function TeamCard({ team, members, onEdit, onDelete }: TeamCardProps) {
  return (
    <Card
      className="relative overflow-hidden border-t-4 flex flex-col justify-between"
      style={{ borderTopColor: team.colorHex }}
    >
      <div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: team.colorHex }}
              />
              <span className="font-bold text-fg text-sm truncate">
                {team.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-primary-text">
                {team.totalPoints} pts
              </span>

              <ActionsList
                actions={[
                  { title: "Edit Team", fn: onEdit },
                  { title: "Delete Team", fn: onDelete, destructive: true },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div>
            <h3 className="text-xl font-black text-fg tracking-tight">
              {members.length > 0 ? members.length : (team.memberCount ?? 0)}{" "}
              <span className="text-xs font-normal text-fg-muted">Members</span>
            </h3>
          </div>

          {members.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border-subtle">
              {members.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-subtle text-xs"
                >
                  <span className="font-semibold text-fg">{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
