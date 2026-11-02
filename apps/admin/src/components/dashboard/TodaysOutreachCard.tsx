"use client";

import React from "react";
import Link from "next/link";
import {
  MessageCircle,
  Cake,
  HeartHandshake,
  UserCheck,
  Clock,
  ChevronRight,
  Check,
  X,
  Mail,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/QueryState";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { CheckInReasonBadge } from "@/components/ui/CheckInBadges";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useConfirmOutreach, useOutreachToday } from "@/hooks/useOutreach";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export interface TodaysOutreachCardProps {
  className?: string;
}

const formatVisitorSubtitle = (visitor: {
  firstSeenDaysAgo?: number | null;
  firstSeenAt?: string | null;
  createdAt?: string | null;
}): string => {
  if (
    visitor.firstSeenDaysAgo !== undefined &&
    visitor.firstSeenDaysAgo !== null &&
    !Number.isNaN(Number(visitor.firstSeenDaysAgo))
  ) {
    const days = Number(visitor.firstSeenDaysAgo);
    if (days <= 0) return "first seen today";
    if (days === 1) return "first seen yesterday";
    return `first seen ${days} days ago`;
  }

  const fallbackDate = visitor.firstSeenAt || visitor.createdAt;
  if (fallbackDate && dayjs(fallbackDate).isValid()) {
    const days = Math.max(
      0,
      dayjs().startOf("day").diff(dayjs(fallbackDate).startOf("day"), "day"),
    );
    if (days === 0) return "first seen today";
    if (days === 1) return "first seen yesterday";
    return `first seen ${days} days ago`;
  }

  return "Follow-up pending";
};

export const TodaysOutreachCard: React.FC<TodaysOutreachCardProps> = ({
  className,
}) => {
  const { data, isLoading, isError, error, refetch } = useOutreachToday();
  const confirmMutation = useConfirmOutreach();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-success-soft text-success-text">
              <MessageCircle className="w-4 h-4" />
            </div>
            <CardTitle>Today&apos;s Outreach</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <ErrorState
          resource="today's outreach"
          error={error}
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const birthdays = data?.birthdays;
  const checkIns = data?.checkIns;
  const visitorFollowUps = data?.visitorFollowUps;
  const unconfirmed = data?.unconfirmed;

  const hasAnyOutreach =
    (birthdays?.items && birthdays.items.length > 0) ||
    (checkIns?.items && checkIns.items.length > 0) ||
    (visitorFollowUps?.items && visitorFollowUps.items.length > 0) ||
    (unconfirmed?.items && unconfirmed.items.length > 0);

  if (!hasAnyOutreach) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-success-soft text-success-text">
              <MessageCircle className="w-4 h-4" />
            </div>
            <CardTitle>Today&apos;s Outreach</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Check}
            title="All caught up!"
            description="No pending outreach tasks, birthdays, or check-ins scheduled for today."
            className="py-8"
          />
        </CardContent>
      </Card>
    );
  }

  const handleConfirmUnconfirmed = (
    id: string,
    personId: string,
    sent: boolean,
  ) => {
    confirmMutation.mutate({ id, personId, sent });
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-success-soft text-success-text">
            <MessageCircle className="w-4 h-4" />
          </div>
          <CardTitle>Today&apos;s Outreach</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* 1. Birthdays today */}
        {birthdays?.items && birthdays.items.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-primary" />
                Birthdays Today ({birthdays.total})
              </span>
              <Link
                href="/reports/birthdays"
                className="text-2xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {birthdays.items.map((person) => {
                const fullName =
                  `${person.firstName} ${person.lastName}`.trim();
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-subtle text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {fullName}
                      </span>
                      {person.emailGreeted && (
                        <Badge
                          variant="indigo"
                          size="sm"
                          className="text-2xs font-medium shrink-0"
                        >
                          <Mail className="w-2.5 h-2.5 mr-1" />
                          Email sent
                        </Badge>
                      )}
                    </div>

                    <WhatsAppButton
                      personId={person.id}
                      purpose="BIRTHDAY"
                      size="sm"
                      label="WhatsApp"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Check-ins due */}
        {checkIns?.items && checkIns.items.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-danger-text" />
                Check-ins Due ({checkIns.total})
              </span>
              <Link
                href="/people?hasPendingCheckIn=true"
                className="text-2xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {checkIns.items.map((task) => {
                const personName = task.person
                  ? `${task.person.firstName} ${task.person.lastName}`.trim()
                  : "Member";
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-subtle text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {personName}
                      </span>
                      <CheckInReasonBadge reason={task.reason} size="sm" />
                    </div>

                    <WhatsAppButton
                      personId={task.personId || task.person.id}
                      purpose="PASTORAL_CHECK_IN"
                      checkInId={task.id}
                      size="sm"
                      label="WhatsApp"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Visitors to follow up */}
        {visitorFollowUps?.items && visitorFollowUps.items.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-warning-text" />
                Visitors to Follow Up ({visitorFollowUps.total})
              </span>
              <Link
                href="/people?membershipStatus=VISITOR&followUpStatus=PENDING"
                className="text-2xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {visitorFollowUps.items.map((visitor) => {
                const fullName =
                  `${visitor.firstName} ${visitor.lastName}`.trim();
                const subtitle = formatVisitorSubtitle(visitor);

                return (
                  <div
                    key={visitor.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-subtle text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">
                        {fullName}
                      </span>
                      <span className="text-2xs text-muted-foreground">
                        {subtitle}
                      </span>
                    </div>

                    <WhatsAppButton
                      personId={visitor.id}
                      purpose="VISITOR_FOLLOW_UP"
                      size="sm"
                      label="WhatsApp"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Waiting for you to confirm */}
        {unconfirmed?.items && unconfirmed.items.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-warning-text">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Waiting for You to Confirm ({unconfirmed.total})
              </span>
              <Link
                href="/messaging-center?tab=whatsapp"
                className="text-2xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
              >
                View log <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {unconfirmed.items.map((msg) => {
                const recipient = msg.person
                  ? `${msg.person.firstName} ${msg.person.lastName}`.trim()
                  : "recipient";
                const timeAgo = dayjs(msg.openedAt).fromNow();

                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl border border-warning-border bg-warning-soft text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <p className="text-warning-text font-medium">
                      You opened a message to <strong>{recipient}</strong>{" "}
                      {timeAgo}. Did you send it?
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={confirmMutation.isPending}
                        onClick={() =>
                          handleConfirmUnconfirmed(msg.id, msg.personId, true)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold bg-success text-white hover:bg-success-hover disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" /> Yes
                      </button>
                      <button
                        type="button"
                        disabled={confirmMutation.isPending}
                        onClick={() =>
                          handleConfirmUnconfirmed(msg.id, msg.personId, false)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-medium border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50"
                      >
                        <X className="w-3 h-3" /> No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysOutreachCard;
