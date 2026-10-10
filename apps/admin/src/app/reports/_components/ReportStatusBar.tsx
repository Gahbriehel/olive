"use client";

import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { monthName } from "./months";

interface ReportStatusBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** 1-based month currently filtering the report, or null for the full year. */
  selectedMonth: number | null;
  onClearMonth: () => void;
}

/** Status tabs above a report table, plus the active month filter chip. */
export function ReportStatusBar({
  tabs,
  activeTab,
  onTabChange,
  selectedMonth,
  onClearMonth,
}: ReportStatusBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
      <div className="overflow-x-auto no-scrollbar max-w-full">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
      </div>

      {selectedMonth && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Badge variant="indigo" size="md">
            Month: {monthName(selectedMonth)}
          </Badge>
          <button
            type="button"
            onClick={onClearMonth}
            className="text-xs text-fg-muted hover:text-fg-secondary underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
