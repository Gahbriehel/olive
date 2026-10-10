"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, UserPlus, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/QueryState";
import { usePeople } from "@/hooks/usePeople";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface RecentPeopleCardProps {
  className?: string;
}

export const RecentPeopleCard: React.FC<RecentPeopleCardProps> = ({
  className,
}) => {
  const router = useRouter();
  const { people, isLoading } = usePeople({ limit: 5 });

  const recentList = people.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-soft text-primary-text">
            <Users className="w-4 h-4" />
          </div>
          <CardTitle>Recent People</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/people")}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          View All
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
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14 rounded-md" />
              </div>
            ))}
          </div>
        ) : recentList.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No people registered yet"
            className="py-8"
          />
        ) : (
          recentList.map((person) => {
            const fullName =
              `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
              "Person";
            const initials =
              fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "P";

            return (
              <div
                key={person.id}
                onClick={() => router.push("/people")}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-subtle hover:bg-muted transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-text font-bold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-fg truncate">
                        {fullName}
                      </p>
                      <StatusBadge
                        status={person.membershipStatus || "VISITOR"}
                        size="sm"
                      />
                    </div>
                    <p className="text-2xs text-fg-muted truncate">
                      {person.email || person.phone || "No contact info"}
                    </p>
                  </div>
                </div>

                {person.createdAt && (
                  <span className="text-2xs text-fg-muted flex items-center gap-1 shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    {dayjs(person.createdAt).fromNow()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
