"use client";

import { Edit3 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActionsList } from "@/components/ui/ActionsList";
import { IGame } from "@/models/game";

interface GameCardProps {
  game: IGame;
  onEdit: () => void;
  onClearScores: () => void;
  onDelete: () => void;
  onManageScores: () => void;
}

export function GameCard({
  game,
  onEdit,
  onClearScores,
  onDelete,
  onManageScores,
}: GameCardProps) {
  const hasScores = game.scores && game.scores.length > 0;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-bold text-fg min-w-0 truncate">
              {game.name}
            </CardTitle>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-fg-muted">
                Max {game.maxScore} pts
              </span>

              <ActionsList
                actions={[
                  { title: "Edit Game", fn: onEdit },
                  ...(hasScores
                    ? [
                        {
                          title: "Clear Scores",
                          fn: onClearScores,
                          destructive: true,
                        },
                      ]
                    : []),
                  { title: "Delete Game", fn: onDelete, destructive: true },
                ]}
              />
            </div>
          </div>
          {game.description && (
            <CardDescription>{game.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-subtle space-y-1.5">
            <p className="font-bold text-fg-secondary">Tournament Results</p>
            {hasScores ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {game.scores.map((s) => (
                  <div
                    key={s.teamId}
                    className="flex items-center justify-between p-1.5 rounded-xl bg-surface-raised border border-border-subtle font-semibold"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {s.teamColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.teamColor }}
                        />
                      )}
                      <span className="truncate">{s.teamName}</span>
                    </div>
                    <span className="font-mono text-primary-text shrink-0 ml-1">
                      +{s.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-fg-muted italic">No scores submitted yet.</p>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={onManageScores}
          leftIcon={<Edit3 className="w-4 h-4 text-primary-text" />}
        >
          Submit / Edit Game Scores
        </Button>
      </div>
    </Card>
  );
}
