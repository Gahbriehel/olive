import React from "react";
import { CalendarDays, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Scripture } from "@/models/scripture";
import { formatCalendarDate } from "./scriptureUtils";

interface Props {
  scripture: Scripture;
  onEdit: (s: Scripture) => void;
  onDelete: (s: Scripture) => void;
}

export const ScriptureCard: React.FC<Props> = ({
  scripture: s,
  onEdit,
  onDelete,
}) => (
  <article className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {s.isCurrent && (
          <Badge size="sm" variant="emerald" dot>
            Live now
          </Badge>
        )}
        <Badge
          size="sm"
          variant={s.status === "PUBLISHED" ? "indigo" : "slate"}
        >
          {s.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          Starts {formatCalendarDate(s.startsOn)}
        </span>
      </div>
      <p className="line-clamp-3 whitespace-pre-line font-serif italic text-fg">
        “{s.text}”
      </p>
      <p className="text-xs font-semibold text-primary-text">
        {s.reference}
        {s.translation ? ` (${s.translation})` : ""}
        {s.givenBy && (
          <span className="font-normal text-fg-muted"> · {s.givenBy}</span>
        )}
      </p>
    </div>
    <div className="flex shrink-0 gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${s.reference}`}
        onClick={() => onEdit(s)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${s.reference}`}
        onClick={() => onDelete(s)}
      >
        <Trash2 className="h-4 w-4 text-danger-text" />
      </Button>
    </div>
  </article>
);
