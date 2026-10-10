import { useState } from "react";
import confetti from "canvas-confetti";
import { IGame, IRecordScorePayload } from "@/models/game";
import { ITeam } from "@/models/team";

interface Options {
  teams: ITeam[];
  recordScore: (dto: IRecordScorePayload) => Promise<unknown>;
  updateScore: (args: {
    id: string;
    payload: Partial<IRecordScorePayload>;
  }) => Promise<unknown>;
}

/**
 * State for the "Manage Scores" modal: the game being scored and the
 * per-team points, notes and existing score ids.
 */
export function useScoreEditor({ teams, recordScore, updateScore }: Options) {
  const [game, setGame] = useState<IGame | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [scoreNotes, setScoreNotes] = useState<Record<string, string>>({});
  const [scoreIds, setScoreIds] = useState<Record<string, string>>({});

  const open = (target: IGame) => {
    setGame(target);
    const initialPoints: Record<string, number> = {};
    const initialNotes: Record<string, string> = {};
    const initialIds: Record<string, string> = {};
    teams.forEach((t) => {
      const existing = target.scores.find((s) => s.teamId === t.id);
      initialPoints[t.id] = existing ? existing.points : 0;
      initialNotes[t.id] = existing?.notes || "";
      if (existing?.id) {
        initialIds[t.id] = existing.id;
      }
    });
    setScoreInputs(initialPoints);
    setScoreNotes(initialNotes);
    setScoreIds(initialIds);
  };

  const close = () => setGame(null);

  const setPoints = (teamId: string, points: number) =>
    setScoreInputs({ ...scoreInputs, [teamId]: points });

  const setNote = (teamId: string, note: string) =>
    setScoreNotes({ ...scoreNotes, [teamId]: note });

  const save = async () => {
    if (!game) return;
    const gameId = game.id;
    const updatedScores = Object.entries(scoreInputs).map(
      ([teamId, points]) => ({
        teamId,
        points: Number(points),
        scoreId: scoreIds[teamId],
        notes: scoreNotes[teamId],
      }),
    );

    for (const score of updatedScores) {
      try {
        if (score.scoreId) {
          await updateScore({
            id: score.scoreId,
            payload: {
              gameId,
              teamId: score.teamId,
              points: score.points,
              notes: score.notes,
            },
          });
        } else {
          await recordScore({
            gameId,
            teamId: score.teamId,
            points: score.points,
            notes: score.notes,
          });
        }
      } catch (err) {
        console.error("Failed to submit score:", err);
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    setGame(null);
  };

  return {
    game,
    open,
    close,
    scoreInputs,
    scoreNotes,
    setPoints,
    setNote,
    save,
  };
}

export type ScoreEditor = ReturnType<typeof useScoreEditor>;
