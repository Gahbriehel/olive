"use client";

import { X } from "lucide-react";

export interface RecipientChip {
  id: string;
  name: string;
  /** One or two letters shown in the avatar dot. */
  initials: string;
  /** Secondary text after the name, e.g. a registration number. */
  meta?: string;
}

interface RecipientChipsProps {
  items: RecipientChip[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Selected-recipient chips with per-chip remove and "Clear all". */
export function RecipientChips({
  items,
  onRemove,
  onClear,
}: RecipientChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-subtle border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-fg-secondary">
          Selected Recipients ({items.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-2xs font-medium text-fg-muted hover:text-danger-text transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border-control text-fg shadow-xs"
          >
            <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
              {item.initials}
            </span>
            <span className="max-w-[130px] truncate font-medium">
              {item.name}
            </span>
            {item.meta && (
              <span className="text-2xs text-fg-muted font-mono">
                ({item.meta})
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-fg-subtle hover:text-danger-text transition-colors ml-0.5 cursor-pointer"
              title="Remove recipient"
              aria-label={`Remove ${item.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
