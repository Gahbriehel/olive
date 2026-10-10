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

/** 12-month coverage grid; clicking a month toggles it as the report filter. */
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
        completed: stat?.completed ?? 0,
        rate: stat?.handlingRate ?? 0,
      };
    });
  }, [monthlyBreakdown]);

  return (
    <div className="rounded-2xl border border-border bg-surface/90 p-3.5 sm:p-4 shadow-xs space-y-3 min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-text" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg-secondary">
            12-Month Outreach Distribution ({selectedYear})
          </h3>
        </div>
        {selectedMonth !== null && (
          <button
            type="button"
            onClick={() => onSelectMonth(null)}
            className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
          >
            Show Full Year
          </button>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2 min-w-[320px]">
          {monthlyStats.map(({ monthNum, abbr, total, completed, rate }) => {
            const isSelected = selectedMonth === monthNum;

            return (
              <button
                key={abbr}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectMonth(isSelected ? null : monthNum)}
                className={clsx(
                  "flex flex-col items-start p-2 sm:p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary-soft shadow-xs ring-2 ring-primary/20"
                    : "border-border hover:border-border-control bg-subtle",
                )}
              >
                <div className="w-full flex items-center justify-between mb-1">
                  <span
                    className={clsx(
                      "text-xs font-bold",
                      isSelected ? "text-primary-text" : "text-fg",
                    )}
                  >
                    {abbr}
                  </span>
                  {total > 0 && (
                    <span className="text-2xs font-mono text-fg-muted">
                      {completed}/{total}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <div className="text-2xs font-semibold text-fg-secondary truncate">
                    {total} {total === 1 ? "b'day" : "b'days"}
                  </div>
                  {total > 0 ? (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="flex-1 h-1.5 bg-muted-strong rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success rounded-full transition-all"
                          style={{ width: `${Math.min(100, rate)}%` }}
                        />
                      </div>
                      <span className="text-2xs font-mono text-success-text">
                        {rate.toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xs text-fg-subtle">None</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
