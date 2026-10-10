"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cake, ChevronRight, Mail, MailCheck, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/QueryState";
import { IUpcomingBirthday } from "@/models/dashboard";
import { SendBirthdayEmailModal } from "./SendBirthdayEmailModal";
import dayjs from "dayjs";

interface UpcomingBirthdaysCardProps {
  birthdays?: IUpcomingBirthday[];
  isLoading?: boolean;
  className?: string;
}

export const UpcomingBirthdaysCard: React.FC<UpcomingBirthdaysCardProps> = ({
  birthdays = [],
  isLoading = false,
  className,
}) => {
  const router = useRouter();
  const [selectedBirthdayForEmail, setSelectedBirthdayForEmail] =
    useState<IUpcomingBirthday | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleOpenEmailModal = (birthday: IUpcomingBirthday) => {
    setSelectedBirthdayForEmail(birthday);
    setIsEmailModalOpen(true);
  };

  const renderCountdownBadge = (birthday: IUpcomingBirthday) => {
    const { daysUntil, nextBirthday, dateOfBirth } = birthday;
    const targetDate = nextBirthday || dateOfBirth;
    const formattedDate = targetDate ? dayjs(targetDate).format("MMM D") : "";

    if (daysUntil === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-bold bg-primary text-white shadow-xs animate-pulse">
          🎉 Today!
        </span>
      );
    }

    if (daysUntil === 1) {
      return (
        <Badge variant="amber" size="sm" className="font-semibold">
          Tomorrow
        </Badge>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        {formattedDate && (
          <span className="text-2xs font-medium text-fg-muted">
            {formattedDate}
          </span>
        )}
        <Badge variant="slate" size="sm">
          In {daysUntil} {daysUntil === 1 ? "day" : "days"}
        </Badge>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-soft text-primary-text">
            <Cake className="w-4 h-4" />
          </div>
          <CardTitle>Upcoming Birthdays</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/reports/birthdays")}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          View Reports
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-subtle"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : birthdays.length === 0 ? (
          <EmptyState
            icon={Cake}
            title="No upcoming birthdays in the next 30 days"
            className="py-8"
          />
        ) : (
          birthdays.map((birthday) => {
            const fullName =
              `${birthday.firstName || ""} ${birthday.lastName || ""}`.trim() ||
              "Member";

            const isGreeted = Boolean(birthday.isGreeted);

            let greetedByText = "Church Admin";
            if (birthday.greetedBy) {
              if (typeof birthday.greetedBy === "object") {
                greetedByText =
                  birthday.greetedBy.name ||
                  `${birthday.greetedBy.firstName || ""} ${birthday.greetedBy.lastName || ""}`.trim() ||
                  "Church Admin";
              }
            }

            const greetedDate = birthday.greetedAt
              ? dayjs(birthday.greetedAt).format("MMM D, YYYY")
              : "";
            const greetedReason = greetedDate
              ? `Greeting already sent by ${greetedByText} on ${greetedDate}`
              : `Greeting already sent by ${greetedByText}`;

            return (
              <div
                key={birthday.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-subtle hover:bg-muted transition-all cursor-pointer group"
                onClick={() => router.push("/people")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-fg truncate">
                        {fullName}
                      </p>
                      <StatusBadge
                        status={birthday.membershipStatus || "MEMBER"}
                        size="sm"
                      />
                    </div>
                    {birthday.email && (
                      <p className="text-2xs text-fg-muted truncate">
                        {birthday.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {renderCountdownBadge(birthday)}

                  {isGreeted && (
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold text-success-text bg-success-soft border border-success-border px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Greeted
                    </span>
                  )}

                  {isGreeted ? (
                    <div className="relative group/tooltip inline-flex items-center">
                      <button
                        type="button"
                        disabled
                        aria-label={greetedReason}
                        title={greetedReason}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-success-text bg-success-soft cursor-not-allowed border border-success-border"
                      >
                        <MailCheck className="w-4 h-4" />
                      </button>
                      <div className="pointer-events-none absolute right-0 bottom-full mb-1.5 hidden group-hover/tooltip:flex z-50 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-2xs font-medium text-surface shadow-lg animate-in fade-in duration-150">
                        {greetedReason}
                      </div>
                    </div>
                  ) : birthday.email ? (
                    <div className="relative group/tooltip inline-flex items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEmailModal(birthday);
                        }}
                        aria-label={`Send birthday greeting to ${birthday.firstName}`}
                        title={`Send birthday greeting to ${birthday.firstName}`}
                        className="p-1.5 rounded-lg text-fg-muted hover:text-primary-text hover:bg-primary-soft transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <div className="pointer-events-none absolute right-0 bottom-full mb-1.5 hidden group-hover/tooltip:flex z-50 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-2xs font-medium text-surface shadow-lg animate-in fade-in duration-150">
                        Send greeting to {birthday.firstName}
                      </div>
                    </div>
                  ) : (
                    <div className="relative group/tooltip inline-flex items-center">
                      <button
                        type="button"
                        disabled
                        aria-label="No email address on record"
                        title="No email address on record"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-fg-subtle bg-muted cursor-not-allowed"
                      >
                        <Mail className="w-4 h-4 opacity-50" />
                      </button>
                      <div className="pointer-events-none absolute right-0 bottom-full mb-1.5 hidden group-hover/tooltip:flex z-50 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-2xs font-medium text-surface shadow-lg animate-in fade-in duration-150">
                        No email address on record
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <SendBirthdayEmailModal
        birthday={selectedBirthdayForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedBirthdayForEmail(null);
        }}
      />
    </Card>
  );
};
