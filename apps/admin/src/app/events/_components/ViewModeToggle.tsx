import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { cn } from "@/helpers/cn";

export type EventsViewMode = "table" | "grid";

const viewToggleClass = (active: boolean) =>
  cn(
    "h-7.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
    active
      ? "bg-surface text-primary-text shadow-xs"
      : "text-fg-muted hover:text-fg",
  );

interface ViewModeToggleProps {
  value: EventsViewMode;
  onChange: (mode: EventsViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="flex h-9 items-center p-0.5 rounded-xl bg-muted border border-border-control shadow-xs"
    >
      <button
        type="button"
        onClick={() => onChange("table")}
        aria-pressed={value === "table"}
        className={viewToggleClass(value === "table")}
        title="Table View"
      >
        <TableIcon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Table</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        className={viewToggleClass(value === "grid")}
        title="Grid Cards View"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Cards</span>
      </button>
    </div>
  );
}
