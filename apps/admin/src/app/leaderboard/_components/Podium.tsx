"use client";

/* eslint-disable no-restricted-syntax -- gold, silver and bronze medal colours are categorical, not semantic tokens */
import { Trophy } from "lucide-react";
import { cn } from "@/helpers/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardEntry } from "@/types/dashboard";

type Place = 1 | 2 | 3;

// Gold / silver / bronze are intentional categorical colours, not tokens.
const PLACE_STYLES: Record<
  Place,
  {
    label: string;
    order: string;
    avatar: string;
    name: string;
    points: string;
    pedestal: string;
  }
> = {
  1: {
    label: "1st",
    order: "order-1 sm:order-2",
    avatar:
      "w-12 h-12 text-xl sm:w-16 sm:h-16 sm:text-2xl shadow-xl ring-4 ring-amber-400/40",
    name: "text-sm font-black",
    points: "text-xs font-black text-warning-text",
    pedestal:
      "bg-amber-500/20 border border-amber-500/30 text-warning-text sm:h-48 sm:text-2xl shadow-lg",
  },
  2: {
    label: "2nd",
    order: "order-2 sm:order-1",
    avatar:
      "w-10 h-10 text-lg sm:w-12 sm:h-12 shadow-lg border-2 border-slate-300",
    name: "text-xs font-bold",
    points: "text-2xs font-bold text-fg-muted",
    pedestal: "bg-muted text-fg-muted sm:h-36 sm:text-xl",
  },
  3: {
    label: "3rd",
    order: "order-3",
    avatar:
      "w-10 h-10 text-lg sm:w-12 sm:h-12 shadow-lg border-2 border-amber-600/40",
    name: "text-xs font-bold",
    points: "text-2xs font-bold text-fg-muted",
    pedestal: "bg-muted text-fg-muted sm:h-28 sm:text-xl",
  },
};

function PodiumSpot({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: Place;
}) {
  const style = PLACE_STYLES[place];
  return (
    <div
      className={cn(
        // Mobile: a ranked row. sm+: a podium column standing on its pedestal.
        "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
        "sm:flex-col sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0",
        style.order,
      )}
    >
      {place === 1 && (
        <Trophy
          className="hidden sm:block w-8 h-8 text-amber-400 mb-1 animate-pulse"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "shrink-0 rounded-2xl text-white font-black flex items-center justify-center sm:mb-2",
          style.avatar,
        )}
        style={{ backgroundColor: entry.colorHex }}
      >
        {place}
      </div>
      <div className="flex min-w-0 flex-1 flex-col sm:w-full sm:flex-none sm:items-center">
        <span
          className={cn(
            "text-fg truncate max-w-full sm:text-center",
            style.name,
          )}
        >
          {entry.teamName}
        </span>
        <span className={cn("font-mono", style.points)}>
          {entry.totalPoints} pts
        </span>
      </div>
      <div
        className={cn(
          "shrink-0 flex items-center justify-center font-black rounded-xl px-3 py-1.5 text-sm",
          "sm:w-full sm:mt-2 sm:px-0 sm:py-0 sm:rounded-b-none sm:rounded-t-2xl",
          style.pedestal,
        )}
      >
        {style.label}
      </div>
    </div>
  );
}

/** Top-3 podium: stacked rows on mobile, classic 2-1-3 podium from sm up. */
export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [first, second, third] = entries;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 sm:items-end sm:pt-4 max-w-2xl mx-auto w-full">
      {first && <PodiumSpot entry={first} place={1} />}
      {second && <PodiumSpot entry={second} place={2} />}
      {third && <PodiumSpot entry={third} place={3} />}
    </div>
  );
}

/** Loading placeholder shaped like the podium + standings list. */
export function LeaderboardSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 sm:items-end sm:pt-4 max-w-2xl mx-auto w-full">
        {(["sm:h-36", "sm:h-48", "sm:h-28"] as const).map((h, i) => (
          <div key={i} className="flex items-center gap-3 sm:flex-col sm:gap-2">
            <Skeleton className="h-10 w-10 rounded-2xl sm:h-12 sm:w-12" />
            <Skeleton className="h-3.5 flex-1 sm:w-2/3 sm:flex-none" />
            <Skeleton
              className={cn(
                "h-8 w-12 rounded-xl sm:w-full sm:rounded-b-none sm:rounded-t-2xl",
                h,
              )}
            />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
