"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { MonthlyBirthdayStat } from "@/models/birthday";
import { MONTH_ABBR } from "../../_components/months";

interface BirthdayMonthStripProps {
  monthlyBreakdown?: MonthlyBirthdayStat[];
  selectedYear: number;
  selectedMonth: number | null;
  /** Select a 1-based month, or null for the full year. */
  onSelectMonth: (month: number | null) => void;
}

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
);

function describe(label: string, total: number, completed: number): string {
  if (total === 0) return `${label}: no birthdays`;
  const rate = Math.round((completed / total) * 100);
  return `${label}: ${total} ${total === 1 ? "birthday" : "birthdays"}, ${completed} handled (${rate}%)`;
}

/**
 * Stacked column chart of birthdays per month (handled vs pending). All 12
 * months fit in one row at any width; clicking a column toggles it as the
 * report filter, and the summary line spells out the selected month (or the
 * full year) so touch users get the detail a hover tooltip would give.
 */
export function BirthdayMonthStrip({
  monthlyBreakdown,
  selectedYear,
  selectedMonth,
  onSelectMonth,
}: BirthdayMonthStripProps) {
  const monthlyStats = useMemo(() => {
    const map = new Map(monthlyBreakdown?.map((m) => [m.month, m]));
    return MONTH_ABBR.map((abbr, idx) => {
      const monthNum = idx + 1;
      const stat = map.get(monthNum);
      return {
        monthNum,
        abbr,
        total: stat?.total ?? 0,
        completed: Math.min(stat?.completed ?? 0, stat?.total ?? 0),
      };
    });
  }, [monthlyBreakdown]);

  const max = Math.max(1, ...monthlyStats.map((m) => m.total));
  const yearTotal = monthlyStats.reduce((sum, m) => sum + m.total, 0);
  const yearCompleted = monthlyStats.reduce((sum, m) => sum + m.completed, 0);

  const selected =
    selectedMonth !== null ? monthlyStats[selectedMonth - 1] : undefined;
  const summary = selected
    ? describe(
        MONTH_NAMES[selected.monthNum - 1],
        selected.total,
        selected.completed,
      )
    : describe(`All of ${selectedYear}`, yearTotal, yearCompleted);

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-5 shadow-xs space-y-3 min-w-0 max-w-full">
      <div className="flex items-start justify-between gap-x-4 gap-y-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 shrink-0 text-primary-text" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg-secondary truncate">
            Birthdays by Month ({selectedYear})
          </h3>
        </div>
        <div className="flex items-center gap-3 text-2xs text-fg-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-success" />
            Handled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-muted-strong" />
            Pending
          </span>
        </div>
      </div>

      <div
        role="group"
        aria-label="Birthdays per month"
        className="grid grid-cols-12 gap-0.5 sm:gap-2 lg:gap-3"
      >
        {monthlyStats.map(({ monthNum, abbr, total, completed }) => {
          const isSelected = selectedMonth === monthNum;
          const isDimmed = selectedMonth !== null && !isSelected;
          const pending = total - completed;
          const label = describe(MONTH_NAMES[monthNum - 1], total, completed);

          return (
            <button
              key={abbr}
              type="button"
              aria-pressed={isSelected}
              aria-label={label}
              title={label}
              onClick={() => onSelectMonth(isSelected ? null : monthNum)}
              className={clsx(
                "group flex flex-col items-center gap-1 min-w-0 rounded-lg px-0.5 pt-1 pb-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isSelected ? "bg-primary-soft" : "hover:bg-subtle",
              )}
            >
              <span
                className={clsx(
                  "text-2xs font-semibold tabular-nums",
                  isSelected ? "text-primary-text" : "text-fg-muted",
                  total === 0 && "invisible",
                )}
              >
                {total}
              </span>

              {/* Column: pending stacked on handled, height relative to the busiest month */}
              <div
                className={clsx(
                  "flex flex-col justify-end w-full max-w-7 h-20 sm:h-28 lg:h-32 transition-opacity",
                  isDimmed && "opacity-40 group-hover:opacity-70",
                )}
              >
                {total === 0 ? (
                  <div className="h-0.5 w-full rounded-full bg-muted-strong" />
                ) : (
                  <div
                    className="flex flex-col gap-0.5 w-full"
                    style={{ height: `${(total / max) * 100}%` }}
                  >
                    {pending > 0 && (
                      <div
                        className={clsx(
                          "w-full bg-muted-strong rounded-t",
                          completed === 0 && "rounded-b-sm",
                        )}
                        style={{ flexGrow: pending, minHeight: 2 }}
                      />
                    )}
                    {completed > 0 && (
                      <div
                        className={clsx(
                          "w-full bg-success rounded-b-sm",
                          pending === 0 && "rounded-t",
                        )}
                        style={{ flexGrow: completed, minHeight: 2 }}
                      />
                    )}
                  </div>
                )}
              </div>

              <span
                className={clsx(
                  "text-2xs sm:text-xs",
                  isSelected
                    ? "font-bold text-primary-text"
                    : "font-semibold text-fg-secondary",
                )}
              >
                <span className="sm:hidden">{abbr.charAt(0)}</span>
                <span className="hidden sm:inline">{abbr}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle">
        <p className="text-xs text-fg-secondary min-w-0" aria-live="polite">
          {summary}
        </p>
        {selectedMonth !== null && (
          <button
            type="button"
            onClick={() => onSelectMonth(null)}
            className="shrink-0 text-xs font-semibold text-primary-text hover:underline cursor-pointer"
          >
            Show full year
          </button>
        )}
      </div>
    </div>
  );
}
