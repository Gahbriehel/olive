"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";
import { ConfessionListItem } from "@/models/confession";
import { AudioStatusBadges } from "./AudioStatusBadges";

interface Props {
  items: ConfessionListItem[];
  /** Drag handles are hidden while a filter hides part of the library. */
  canReorder: boolean;
  busy?: boolean;
  onReorder: (next: ConfessionListItem[]) => void;
  onDelete: (item: ConfessionListItem) => void;
}

export const ConfessionsTable: React.FC<Props> = ({
  items,
  canReorder,
  busy,
  onReorder,
  onDelete,
}) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reset = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleDrop = (targetId: string) => {
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    reset();
    if (from < 0 || to < 0 || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table
        className="w-full min-w-[820px] text-left text-sm"
        aria-busy={busy}
      >
        <thead className="bg-subtle text-xs font-semibold text-fg-muted">
          <tr>
            <th className="w-10 px-3 py-3" aria-label="Reorder" />
            <th className="w-12 px-3 py-3">#</th>
            <th className="px-3 py-3">Title</th>
            <th className="px-3 py-3">Category</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Audio</th>
            <th className="px-3 py-3 text-right">Listens</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {items.map((c) => (
            <tr
              key={c.id}
              draggable={canReorder}
              onDragStart={(e) => {
                setDragId(c.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setOverId(c.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(c.id);
              }}
              onDragEnd={reset}
              className={cn(
                "transition-colors hover:bg-subtle",
                dragId === c.id && "opacity-50",
                overId === c.id && dragId !== c.id && "bg-primary-soft",
              )}
            >
              <td className="px-3 py-3">
                {canReorder && (
                  <GripVertical
                    aria-hidden
                    className="h-5 w-5 cursor-grab text-fg-subtle active:cursor-grabbing"
                  />
                )}
              </td>
              <td className="px-3 py-3 font-mono text-fg-muted">
                {c.position ?? "-"}
              </td>
              <td className="px-3 py-3">
                <Link
                  href={`/confessions/${c.id}`}
                  className="font-semibold text-fg hover:text-primary-text"
                >
                  {c.title}
                </Link>
                {c.scriptureRef && (
                  <p className="text-xs text-fg-muted">{c.scriptureRef}</p>
                )}
              </td>
              <td className="px-3 py-3 text-fg-secondary">
                {c.category ?? "—"}
              </td>
              <td className="px-3 py-3">
                <Badge
                  size="sm"
                  variant={c.status === "PUBLISHED" ? "emerald" : "slate"}
                >
                  {c.status === "PUBLISHED" ? "Live" : "Draft"}
                </Badge>
              </td>
              <td className="px-3 py-3">
                <AudioStatusBadges audio={c.audio} audioStale={c.audioStale} />
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                {c.listenCount.toLocaleString()}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/confessions/${c.id}`}
                    aria-label={`Edit ${c.title}`}
                  >
                    <Button variant="ghost" size="icon" tabIndex={-1}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${c.title}`}
                    onClick={() => onDelete(c)}
                  >
                    <Trash2 className="h-4 w-4 text-danger-text" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
