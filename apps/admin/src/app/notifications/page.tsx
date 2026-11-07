"use client";

import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { BellRing, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePushOverview } from "@/hooks/useNotifications";
import { PUSH_TOPICS, PushLogEntry } from "@/models/notifications";

dayjs.extend(utc);
dayjs.extend(timezone);

const TOPIC_VARIANT: Record<string, BadgeVariant> = {
  "night-prayer": "purple",
  confessions: "indigo",
  scriptures: "emerald",
  encouragement: "amber",
};

const lagosTime = (iso: string) =>
  dayjs(iso).tz("Africa/Lagos").format("YYYY-MM-DD hh:mm A");

function Delivery({ log }: { log: PushLogEntry }) {
  const pct =
    log.recipients > 0
      ? ((log.delivered / log.recipients) * 100).toFixed(1)
      : "0.0";
  return (
    <div className="space-y-0.5 whitespace-nowrap text-xs">
      <p className="font-semibold text-fg">
        {log.delivered} / {log.recipients} ({pct}%)
      </p>
      {log.failed > 0 && (
        <p className="inline-block rounded-md bg-danger-soft px-1.5 py-0.5 text-danger-text">
          {log.failed} failed
        </p>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { overview, isLoading, isError, error, refetch } = usePushOverview();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Push Notifications"
        description="Who is subscribed, and the most recent pushes sent to members."
        icon={BellRing}
        actions={
          <ListToolbar actions={[{ title: "Refresh", fn: () => refetch() }]} />
        }
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={false}
        resource="notification metrics"
        loading={
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        {overview && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="p-5">
                <p className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
                  <Smartphone className="h-4 w-4" aria-hidden /> Total active
                  devices
                </p>
                <p className="mt-2 text-3xl font-bold text-fg">
                  {overview.subscribers.total.toLocaleString()}
                </p>
              </Card>
              <Card className="p-5 md:col-span-2">
                <p className="text-xs font-semibold text-fg-muted">
                  Subscribers by topic
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PUSH_TOPICS.map((t) => (
                    <Badge key={t} variant={TOPIC_VARIANT[t]}>
                      {t}:{" "}
                      {(overview.subscribers.byTopic[t] ?? 0).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="overflow-x-auto">
              <CardHeader>
                <CardTitle>Send history</CardTitle>
                <CardDescription>
                  The 50 most recent pushes. Times are Africa/Lagos.
                </CardDescription>
              </CardHeader>
              {overview.logs.length === 0 ? (
                <p className="p-5 pt-0 text-sm text-fg-muted">
                  No notifications have been sent yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-y border-border text-xs text-fg-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Timestamp</th>
                      <th className="px-4 py-3 font-semibold">Topic</th>
                      <th className="px-4 py-3 font-semibold">Message</th>
                      <th className="px-4 py-3 font-semibold">Link</th>
                      <th className="px-4 py-3 font-semibold">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overview.logs.map((l) => (
                      <tr key={l.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-fg-secondary">
                          {lagosTime(l.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            size="sm"
                            variant={TOPIC_VARIANT[l.topic] ?? "slate"}
                          >
                            {l.topic}
                          </Badge>
                        </td>
                        <td className="max-w-sm px-4 py-3">
                          <p className="font-semibold text-fg">{l.title}</p>
                          <p className="line-clamp-2 text-xs text-fg-muted">
                            {l.body}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                          {l.url}
                        </td>
                        <td className="px-4 py-3">
                          <Delivery log={l} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}
