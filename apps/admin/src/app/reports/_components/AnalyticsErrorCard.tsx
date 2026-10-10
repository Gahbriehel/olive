import { ErrorState } from "@/components/ui/QueryState";

interface AnalyticsErrorCardProps {
  resource: string;
  error: unknown;
  onRetry: () => void;
}

/** Error state with retry, in the card frame used by report KPI sections. */
export function AnalyticsErrorCard({
  resource,
  error,
  onRetry,
}: AnalyticsErrorCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-xs">
      <ErrorState resource={resource} error={error} onRetry={onRetry} />
    </div>
  );
}
