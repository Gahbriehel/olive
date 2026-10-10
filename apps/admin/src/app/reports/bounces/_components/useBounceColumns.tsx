"use client";

import { useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionsList, ActionItem } from "@/components/ui/ActionsList";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { EmailBounce } from "@/models/emailBounce";

const columnHelper = createColumnHelper<EmailBounce>();

interface BounceColumnHandlers {
  canManage: boolean;
  onRemediate: (bounce: EmailBounce) => void;
  onResolve: (bounce: EmailBounce) => void;
  onView: (bounce: EmailBounce) => void;
}

/** Column definitions for the bounces table. Pass stable handlers. */
export function useBounceColumns({
  canManage,
  onRemediate,
  onResolve,
  onView,
}: BounceColumnHandlers) {
  return useMemo<ColumnDef<EmailBounce>[]>(
    () =>
      [
        columnHelper.accessor("email", {
          header: "Recipient",
          cell: ({ row }) => {
            const item = row.original;
            const initials = (item.recipientName || item.email || "E")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-danger-soft text-danger-text font-bold text-xs flex items-center justify-center shrink-0 border border-danger-border">
                  {initials}
                </div>
                <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.recipientName && (
                      <p className="text-xs font-bold text-fg truncate">
                        {item.recipientName}
                      </p>
                    )}
                    {item.recipientType && (
                      <Badge
                        variant={
                          item.recipientType === "PERSON" ? "indigo" : "cyan"
                        }
                        size="sm"
                        className="text-2xs px-1 py-0"
                      >
                        {item.recipientType}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xs font-mono text-fg-secondary truncate mt-0.5">
                    <TruncatedTextWithCopy
                      text={item.email}
                      maxLength={24}
                      textClassName="text-2xs font-mono text-fg-secondary"
                    />
                  </div>
                </div>
              </div>
            );
          },
        }),

        columnHelper.accessor("bounceType", {
          header: "Classification",
          cell: ({ row }) => {
            const item = row.original;
            const isHard =
              item.bounceType?.toLowerCase() === "hard" ||
              item.eventType?.toLowerCase().includes("failed");

            return (
              <div className="space-y-0.5 whitespace-nowrap">
                <StatusBadge
                  status={isHard ? "BOUNCED" : item.bounceType || "BOUNCED"}
                  size="sm"
                />
                {item.eventType && (
                  <p className="text-2xs text-fg-muted font-mono truncate max-w-[120px]">
                    {item.eventType}
                  </p>
                )}
              </div>
            );
          },
        }),

        columnHelper.accessor("emailType", {
          header: "Context / Template",
          cell: ({ getValue }) => {
            const emailType = getValue();
            if (!emailType) return <NotAvailable />;
            return (
              <div className="max-w-[160px] truncate text-xs font-medium text-fg-secondary">
                <span title={emailType}>{emailType}</span>
              </div>
            );
          },
        }),

        columnHelper.accessor("reason", {
          header: "Diagnostic Reason",
          cell: ({ getValue }) => {
            const reason = getValue();
            if (!reason) return <NotAvailable />;
            return (
              <div className="max-w-[220px] sm:max-w-[280px]">
                <p
                  className="text-xs font-mono text-fg-secondary truncate"
                  title={reason}
                >
                  {reason}
                </p>
              </div>
            );
          },
        }),

        columnHelper.accessor("isResolved", {
          header: "Status",
          cell: ({ getValue }) => {
            const isResolved = getValue();
            if (isResolved) {
              return (
                <Badge
                  variant="emerald"
                  size="sm"
                  className="font-semibold whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </Badge>
              );
            }
            return (
              <Badge
                variant="amber"
                size="sm"
                className="font-semibold whitespace-nowrap"
              >
                <AlertTriangle className="w-3 h-3" /> Action Needed
              </Badge>
            );
          },
        }),

        columnHelper.accessor("createdAt", {
          header: "Recorded",
          cell: ({ getValue }) => {
            const val = getValue();
            if (!val) return <NotAvailable />;
            return (
              <div className="space-y-0.5 whitespace-nowrap">
                <p className="text-xs font-medium text-fg">
                  {dayjs(val).format("MMM D, YYYY")}
                </p>
                <p className="text-2xs text-fg-muted">
                  {dayjs(val).format("h:mm A")}
                </p>
              </div>
            );
          },
        }),

        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: ({ row }) => {
            const item = row.original;
            const actions: ActionItem[] = [
              ...(canManage && !item.isResolved
                ? [
                    {
                      title: "Fix & Remediate Email",
                      fn: () => onRemediate(item),
                    },
                    {
                      title: "Mark as Resolved",
                      fn: () => onResolve(item),
                    },
                  ]
                : []),
              {
                title: "View Full Diagnostics",
                fn: () => onView(item),
              },
            ];

            return (
              <div className="flex justify-end">
                <ActionsList actions={actions} />
              </div>
            );
          },
        }),
      ] as ColumnDef<EmailBounce>[],
    [canManage, onRemediate, onResolve, onView],
  );
}
