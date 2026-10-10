import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/FormElements/Input";
import {
  EmptyState,
  QueryState,
  SkeletonList,
} from "@/components/ui/QueryState";
import { IGame } from "@/models/game";
import { ITeam } from "@/models/team";
import { type ScoreEditor } from "./useScoreEditor";

interface ManageScoresModalProps {
  editor: ScoreEditor;
  teams: ITeam[];
  teamsLoading: boolean;
  teamsError: boolean;
  teamsErrorValue: unknown;
  onRetryTeams: () => void;
  onClearScores: (game: IGame | null) => void;
}

export function ManageScoresModal({
  editor,
  teams,
  teamsLoading,
  teamsError,
  teamsErrorValue,
  onRetryTeams,
  onClearScores,
}: ManageScoresModalProps) {
  const { game, close, scoreInputs, scoreNotes, setPoints, setNote, save } =
    editor;

  return (
    <Modal
      isOpen={!!game}
      onClose={close}
      title={`Manage Scores: ${game?.name}`}
      description={`Award or update team points for ${game?.name} (Max Points: ${game?.maxScore})`}
    >
      <div className="space-y-4 text-xs">
        <QueryState
          isLoading={teamsLoading}
          isError={teamsError}
          error={teamsErrorValue}
          onRetry={onRetryTeams}
          resource="teams"
          isEmpty={teams.length === 0}
          loading={<SkeletonList rows={3} />}
          empty={
            <EmptyState
              icon={Users}
              title="No teams yet"
              description="Create teams for this event before recording scores."
            />
          }
        >
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-3 rounded-xl border border-border bg-subtle space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.colorHex }}
                    />
                    <span className="font-bold text-fg">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={scoreInputs[team.id] ?? 0}
                      onChange={(e) =>
                        setPoints(team.id, Number(e.target.value))
                      }
                      className="w-24 text-right font-mono"
                    />
                    <span className="text-fg-muted font-mono">pts</span>
                  </div>
                </div>
                <Input
                  placeholder="Score notes (optional)..."
                  value={scoreNotes[team.id] || ""}
                  onChange={(e) => setNote(team.id, e.target.value)}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </QueryState>

        <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onClearScores(game)}
          >
            Clear Scores
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              Save Game Scores
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
