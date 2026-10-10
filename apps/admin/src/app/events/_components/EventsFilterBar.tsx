import { DoorOpen, Filter, Search, Star, Ticket } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";
import { type FilterKey, type FilterValues } from "@/models/filters";
import { eventSelectFields } from "./eventFilters";

const chipBase =
  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer";

interface EventsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterValues;
  setFilter: (key: FilterKey, value: string) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function EventsFilterBar({
  search,
  onSearchChange,
  filters,
  setFilter,
  hasActiveFilters,
  onReset,
}: EventsFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 bg-surface p-4 rounded-2xl border border-border shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {eventSelectFields.map((field, idx) => (
          <div key={field.key}>
            <Select
              aria-label={field.label}
              value={filters[field.key] ?? ""}
              onChange={(e) => setFilter(field.key, e.target.value)}
              leftIcon={idx === 0 ? <Filter className="w-4 h-4" /> : undefined}
            >
              <option value="">{field.allLabel}</option>
              {field.type === "boolean" ? (
                <>
                  <option value="true">{field.trueLabel}</option>
                  <option value="false">{field.falseLabel}</option>
                </>
              ) : (
                field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )}
            </Select>
          </div>
        ))}
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border-subtle text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xs font-semibold text-fg-subtle">
            Quick Filter:
          </span>
          <button
            type="button"
            aria-pressed={!filters.isFeatured}
            onClick={() => setFilter("isFeatured", "")}
            className={cn(
              chipBase,
              !filters.isFeatured
                ? "bg-fg text-surface shadow-xs"
                : "bg-muted text-fg-secondary hover:bg-muted-strong",
            )}
          >
            All Events
          </button>
          <button
            type="button"
            aria-pressed={filters.isFeatured === "true"}
            onClick={() => setFilter("isFeatured", "true")}
            className={cn(
              chipBase,
              filters.isFeatured === "true"
                ? "bg-warning text-white shadow-xs"
                : "bg-warning-soft text-warning-text",
            )}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Featured On Website
          </button>
          <button
            type="button"
            aria-pressed={filters.requiresRegistration === "false"}
            onClick={() => setFilter("requiresRegistration", "false")}
            className={cn(
              chipBase,
              filters.requiresRegistration === "false"
                ? "bg-success text-white shadow-xs"
                : "bg-success-soft text-success-text",
            )}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            Open Admission
          </button>
          <button
            type="button"
            aria-pressed={filters.requiresRegistration === "true"}
            onClick={() => setFilter("requiresRegistration", "true")}
            className={cn(
              chipBase,
              filters.requiresRegistration === "true"
                ? "bg-primary text-white shadow-xs"
                : "bg-primary-soft text-primary-text",
            )}
          >
            <Ticket className="w-3.5 h-3.5" />
            Registration Required
          </button>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-text"
            onClick={onReset}
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}
