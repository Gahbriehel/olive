"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Clock, DoorOpen, Star, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionsList, type ActionItem } from "@/components/ui/ActionsList";
import { getCategoryColor } from "@/models/event";
import { IChurchEvent } from "@/types/dashboard";

/** Column definitions for the events table view. */
export function useEventColumns(
  getEventActions: (evt: IChurchEvent) => ActionItem[],
) {
  const router = useRouter();

  return useMemo<ColumnDef<IChurchEvent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Title & Badges",
        cell: ({ row }) => {
          const evt = row.original;
          return (
            <div className="flex items-center gap-3">
              {evt.imageUrl && (
                <div
                  onClick={() => router.push(`/events/${evt.id}`)}
                  className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0 border border-border-control cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={evt.imageUrl}
                    alt={evt.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="font-bold text-fg hover:text-primary-text cursor-pointer transition-colors"
                  >
                    {evt.name}
                  </span>
                  {evt.isFeatured && (
                    <Badge
                      color="gold"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      FEATURED
                    </Badge>
                  )}
                </div>
                {evt.description && (
                  <p className="text-2xs text-fg-subtle line-clamp-1 max-w-xs">
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            <Badge color={getCategoryColor(row.original.category)} size="sm">
              {row.original.category}
            </Badge>
          </span>
        ),
      },
      {
        accessorKey: "requiresRegistration",
        header: "Admission Type",
        cell: ({ row }) =>
          row.original.requiresRegistration ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-text whitespace-nowrap">
              <Ticket className="w-3.5 h-3.5 text-primary" />
              Registration Required
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-text whitespace-nowrap">
              <DoorOpen className="w-3.5 h-3.5 text-success" />
              Open Admission
            </span>
          ),
      },
      {
        accessorKey: "registeredCount",
        header: "Capacity / Attendance",
        cell: ({ row }) => {
          const evt = row.original;
          if (!evt.requiresRegistration) {
            return (
              <span className="text-xs font-medium text-fg-subtle whitespace-nowrap">
                Open Admission
              </span>
            );
          }
          return (
            <div className="space-y-1 whitespace-nowrap">
              <span className="font-mono text-xs font-semibold text-fg">
                {evt.registeredCount}/
                {evt.capacity !== null && evt.capacity !== undefined
                  ? evt.capacity
                  : "∞"}
              </span>
              {evt.capacity ? (
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round((evt.registeredCount / evt.capacity) * 100),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              ) : (
                <p className="text-2xs text-fg-subtle">Unlimited seats</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: "Schedule & Location",
        cell: ({ row }) => (
          <div className="space-y-0.5 text-fg-secondary">
            <p className="font-medium truncate max-w-[180px]">
              {row.original.location || "Sanctuary"}
            </p>
            <p className="text-2xs text-fg-subtle flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(row.original.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} size="sm" />
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <ActionsList actions={getEventActions(row.original)} />
          </div>
        ),
      },
    ],
    [router, getEventActions],
  );
}
