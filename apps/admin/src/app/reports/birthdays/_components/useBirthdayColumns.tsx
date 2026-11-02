"use client";

import { useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Cake, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActionsList, ActionItem } from "@/components/ui/ActionsList";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { BirthdayPersonItem } from "@/models/birthday";

import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const columnHelper = createColumnHelper<BirthdayPersonItem>();

interface BirthdayColumnOptions {
  /** Only super admins see the age a member is turning. */
  showAge: boolean;
  onView: (person: BirthdayPersonItem) => void;
  onSendEmail: (person: BirthdayPersonItem) => void;
}

/** Column definitions for the birthday directory. Pass stable handlers. */
export function useBirthdayColumns({
  showAge,
  onView,
  onSendEmail,
}: BirthdayColumnOptions) {
  return useMemo<ColumnDef<BirthdayPersonItem>[]>(() => {
    return [
      columnHelper.accessor(
        (row) => `${row.firstName} ${row.lastName}`.trim(),
        {
          id: "member",
          header: "Member",
          cell: ({ row }) => {
            const person = row.original;
            const fullName =
              [person.firstName, person.lastName].filter(Boolean).join(" ") ||
              "Member";
            const initials =
              `${person.firstName?.[0] || ""}${person.lastName?.[0] || ""}`.toUpperCase();

            return (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-soft text-primary-text font-bold text-xs flex items-center justify-center shrink-0 border border-primary-border">
                  {initials || <Cake className="w-4 h-4" />}
                </div>
                <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                  <p className="text-xs font-bold text-fg truncate">
                    {fullName}
                  </p>
                  <div className="text-2xs text-fg-muted truncate">
                    {person.email ? (
                      <TruncatedTextWithCopy
                        text={person.email}
                        maxLength={22}
                        textClassName="text-2xs text-fg-muted"
                      />
                    ) : person.phone ? (
                      <span>{person.phone}</span>
                    ) : (
                      <NotAvailable />
                    )}
                  </div>
                </div>
              </div>
            );
          },
        },
      ),

      columnHelper.accessor("membershipStatus", {
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={String(getValue() || "MEMBER")} size="sm" />
        ),
      }),

      columnHelper.accessor("birthdayDate", {
        header: "Birthday",
        cell: ({ row }) => {
          const person = row.original;
          const target = person.birthdayDate || person.dateOfBirth;
          return (
            <div className="space-y-0.5 whitespace-nowrap">
              <p className="text-xs font-semibold text-fg">
                {target ? dayjs(target).format("MMM D") : "—"}
              </p>
              {showAge &&
                person.turningAge !== undefined &&
                person.turningAge !== null && (
                  <span className="text-2xs font-medium text-fg-muted">
                    Turning {person.turningAge}
                  </span>
                )}
            </div>
          );
        },
      }),

      columnHelper.accessor("daysUntil", {
        header: "Due",
        cell: ({ getValue }) => {
          const days = Number(getValue());
          if (days === 0) {
            return (
              <Badge
                variant="indigo"
                size="sm"
                className="font-bold whitespace-nowrap animate-pulse"
              >
                🎉 Today!
              </Badge>
            );
          }
          if (days === 1) {
            return (
              <Badge
                variant="amber"
                size="sm"
                className="font-semibold whitespace-nowrap"
              >
                Tomorrow
              </Badge>
            );
          }
          if (days > 1) {
            return (
              <Badge variant="slate" size="sm" className="whitespace-nowrap">
                In {days} days
              </Badge>
            );
          }
          return (
            <Badge variant="rose" size="sm" className="whitespace-nowrap">
              {Math.abs(days)}d ago
            </Badge>
          );
        },
      }),

      columnHelper.accessor("status", {
        header: "Outreach Status",
        cell: ({ row }) => {
          const person = row.original;
          const emailGreeted =
            person.greetedChannels?.includes("EMAIL") ||
            Boolean(person.greeting) ||
            person.status === "COMPLETED";
          const whatsappGreeted =
            person.greetedChannels?.includes("WHATSAPP") ||
            Boolean(person.whatsappGreeting);

          if (emailGreeted || whatsappGreeted) {
            return (
              <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap">
                {emailGreeted && (
                  <Badge
                    variant="indigo"
                    size="sm"
                    className="font-semibold text-2xs inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Email
                  </Badge>
                )}
                {whatsappGreeted && (
                  <Badge
                    variant="emerald"
                    size="sm"
                    className="font-semibold text-2xs inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> WhatsApp
                  </Badge>
                )}
              </div>
            );
          }

          if (person.status === "MISSED") {
            return (
              <Badge
                variant="rose"
                size="sm"
                className="font-semibold w-fit whitespace-nowrap"
              >
                <AlertCircle className="w-3 h-3" /> Missed
              </Badge>
            );
          }

          return (
            <Badge
              variant="amber"
              size="sm"
              className="font-semibold w-fit whitespace-nowrap"
            >
              <Clock className="w-3 h-3" /> Pending
            </Badge>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const person = row.original;
          const isGreeted =
            person.isGreeted ||
            person.status === "COMPLETED" ||
            Boolean(person.greeting) ||
            Boolean(person.whatsappGreeting);

          const actions: ActionItem[] = isGreeted
            ? [
                { title: "View Record", fn: () => onView(person) },
                ...(person.email
                  ? [
                      {
                        title: "Send Another Email",
                        fn: () => onSendEmail(person),
                      },
                    ]
                  : []),
              ]
            : [
                {
                  title: "Send Birthday Email",
                  disabled: !person.email,
                  fn: () => onSendEmail(person),
                },
              ];

          return (
            <div className="flex items-center justify-end gap-1.5">
              <WhatsAppButton
                personId={person.id}
                purpose="BIRTHDAY"
                size="sm"
                onSendEmailInstead={() => onSendEmail(person)}
              />
              <ActionsList actions={actions} />
            </div>
          );
        },
      }),
    ] as ColumnDef<BirthdayPersonItem>[];
  }, [showAge, onView, onSendEmail]);
}
