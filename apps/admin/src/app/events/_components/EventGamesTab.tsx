import { Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  EmptyState,
  QueryState,
  SkeletonList,
} from "@/components/ui/QueryState";
import { type EventDetailData } from "./useEventDetailData";

interface EventGamesTabProps {
  data: EventDetailData["games"];
}

export function EventGamesTab({ data }: EventGamesTabProps) {
  const { games, isLoading, isError, error, refetch } = data;

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={games.length === 0}
      resource="games"
      loading={
        <div className="rounded-2xl border border-border bg-surface p-4">
          <SkeletonList rows={3} />
        </div>
      }
      empty={
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={Gamepad2}
            title="No games yet"
            description="Games created for this event will be listed here."
          />
        </div>
      }
    >
      <div className="space-y-3">
        {games.map((g, idx) => (
          <Card key={g.id}>
            <CardContent className="p-4 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-sm text-fg">{g.name}</h4>
                <p className="text-fg-subtle">Max Score: {g.maxScore} pts</p>
              </div>
              <span className="font-mono text-xs text-primary-text font-bold">
                Game #{idx + 1}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </QueryState>
  );
}
