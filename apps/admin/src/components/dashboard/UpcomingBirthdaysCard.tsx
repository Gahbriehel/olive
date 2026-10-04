"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cake, ChevronRight, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25 animate-pulse">
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
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
          <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
            <Cake className="w-4 h-4" />
          </div>
          <CardTitle>Upcoming Birthdays</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/people")}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          View People
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40"
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
          <div className="text-center py-6 px-4 text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500">
              <Cake className="w-5 h-5" />
            </div>
            <p>No upcoming birthdays in the next 30 days</p>
          </div>
        ) : (
          birthdays.map((birthday) => {
            const fullName =
              `${birthday.firstName || ""} ${birthday.lastName || ""}`.trim() ||
              "Member";

            return (
              <div
                key={birthday.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 transition-all cursor-pointer group"
                onClick={() => router.push("/people")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {fullName}
                      </p>
                      <StatusBadge
                        status={birthday.membershipStatus || "MEMBER"}
                        size="sm"
                      />
                      {/* {birthday.turningAge !== undefined &&
                        birthday.turningAge !== null && (
                          <Badge variant="purple" size="sm">
                            Turning {birthday.turningAge}
                          </Badge>
                        )} */}
                    </div>
                    {birthday.email && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {birthday.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {renderCountdownBadge(birthday)}

                  {birthday.email ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEmailModal(birthday);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/60 transition-colors cursor-pointer"
                      title={`Send birthday greeting to ${birthday.firstName}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/people");
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      title="View person details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
