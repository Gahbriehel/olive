import { Gamepad2, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/QueryState";

interface GamesEmptyStateProps {
  search: string;
  onClearSearch: () => void;
  onCreate: () => void;
}

export function GamesEmptyState({
  search,
  onClearSearch,
  onCreate,
}: GamesEmptyStateProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border">
      {search ? (
        <EmptyState
          icon={SearchX}
          title="No games match your search"
          description={`Nothing found for "${search}".`}
          action={
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear search
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Gamepad2}
          title="No games yet"
          description="Create a game to start recording team scores."
          action={
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onCreate}
            >
              Create game
            </Button>
          }
        />
      )}
    </div>
  );
}
