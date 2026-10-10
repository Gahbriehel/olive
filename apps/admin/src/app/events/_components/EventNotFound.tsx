import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  EmptyState,
  ErrorState,
  SkeletonCardGrid,
} from "@/components/ui/QueryState";

interface EventNotFoundProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

/** Loading / error / not-found states for the event detail page. */
export function EventNotFound({
  isLoading,
  isError,
  error,
  onRetry,
}: EventNotFoundProps) {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Event details"
        breadcrumbs={[{ label: "Events", href: "/events" }, { label: "Event" }]}
      />
      {isLoading ? (
        <SkeletonCardGrid count={4} />
      ) : (
        <div className="rounded-2xl border border-border bg-surface">
          {isError ? (
            <ErrorState resource="this event" error={error} onRetry={onRetry} />
          ) : (
            <EmptyState
              icon={CalendarX}
              title="Event not found."
              description="It may have been deleted, or the link is incorrect."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => router.push("/events")}
                >
                  Back to events
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
