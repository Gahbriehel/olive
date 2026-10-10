"use client";

import { type ReactNode } from "react";
import { AlertTriangle, Inbox, RotateCw, type LucideIcon } from "lucide-react";
import { cn } from "@/helpers/cn";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { extractErrorMessage } from "@/utils/api-client";

/* ------------------------------------------------------------------ */
/* Empty / error building blocks                                        */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** e.g. a "Create event" or "Clear filters" button. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-1 rounded-2xl bg-muted p-3 text-fg-subtle">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-fg">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  /** What failed to load, e.g. "events". */
  resource?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  resource = "this data",
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-1 rounded-2xl bg-danger-soft p-3 text-danger-text">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-fg">
        Couldn&apos;t load {resource}
      </p>
      <p className="max-w-sm text-xs text-fg-muted">
        {error
          ? extractErrorMessage(
              error,
              "Something went wrong. Please try again.",
            )
          : "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          leftIcon={<RotateCw className="h-3.5 w-3.5" />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton presets                                                     */
/* ------------------------------------------------------------------ */

/** Placeholder for card-grid lists (events, games, teams, ...). */
export function SkeletonCardGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder rows for simple lists (activity feeds, rosters). */
export function SkeletonList({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("space-y-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QueryState                                                           */
/* ------------------------------------------------------------------ */

interface QueryStateProps {
  isLoading: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  /** Shown while loading. Use a skeleton shaped like the content. */
  loading: ReactNode;
  /** Shown when loaded with no results. */
  empty?: ReactNode;
  /** What failed to load, for the error message ("events", "teams"). */
  resource?: string;
  children: ReactNode;
}

/**
 * Loading → error → empty → content, in that order. A failed fetch never
 * renders as "no results", and an empty message never shows while loading.
 */
export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  loading,
  empty,
  resource,
  children,
}: QueryStateProps) {
  if (isLoading) return <>{loading}</>;
  if (isError)
    return <ErrorState resource={resource} error={error} onRetry={onRetry} />;
  if (isEmpty) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  return <>{children}</>;
}
