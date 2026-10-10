"use client";

import { Calendar } from "lucide-react";

interface YearSelectProps {
  value: number;
  years: number[];
  onChange: (year: number) => void;
}

/** Compact year picker for report headers. */
export function YearSelect({ value, years, onChange }: YearSelectProps) {
  return (
    <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1 shadow-xs">
      <Calendar className="w-3.5 h-3.5 text-fg-subtle" />
      {/* ≥16px on mobile to avoid iOS zoom */}
      <select
        aria-label="Year"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-base sm:text-xs font-semibold bg-transparent text-fg border-none focus:outline-none cursor-pointer"
      >
        {years.map((yr) => (
          <option key={yr} value={yr} className="bg-surface">
            {yr}
          </option>
        ))}
      </select>
    </div>
  );
}
