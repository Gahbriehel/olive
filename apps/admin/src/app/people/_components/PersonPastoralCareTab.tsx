"use client";

import React from "react";
import {
  HeartHandshake,
  Plus,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  FileText,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CheckInReasonBadge,
  CheckInStatusBadge,
} from "@/components/ui/CheckInBadges";
import { IPerson } from "@/models/person";
import { IPastoralCheckIn } from "@/models/checkIn";

interface PersonPastoralCareTabProps {
  person: IPerson;
  checkIns: IPastoralCheckIn[];
  isLoading?: boolean;
  onLogCheckIn: () => void;
  onScheduleCare: () => void;
  onCompleteCheckIn: (checkIn: IPastoralCheckIn) => void;
  onCancelCheckIn: (checkInId: string) => void;
}

export const PersonPastoralCareTab: React.FC<PersonPastoralCareTabProps> = ({
  person,
  checkIns,
  isLoading = false,
  onLogCheckIn,
  onScheduleCare,
  onCompleteCheckIn,
  onCancelCheckIn,
}) => {
  const scheduledTasks = checkIns.filter((c) => c.status === "SCHEDULED");
  const completedHistory = checkIns.filter((c) => c.status !== "SCHEDULED");

  if (isLoading) {
    return (
      <div className="p-8 text-center text-fg-muted space-y-2">
        <Clock className="w-5 h-5 animate-spin mx-auto text-primary" />
        <p className="text-2xs">Loading pastoral care history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Action Header */}
      <div className="p-4 rounded-xl bg-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-bold text-fg flex items-center gap-1.5 text-xs">
            <HeartHandshake className="w-4 h-4 text-primary" />
            Pastoral Check-ins & Member Care
          </p>
          <p className="text-2xs text-fg-muted mt-0.5">
            Cyclical care with full audit history for {person.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={onScheduleCare}
          >
            <Clock className="w-3.5 h-3.5 text-warning-text" />
            <span>Flag for Care</span>
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="gap-1 text-xs"
            onClick={onLogCheckIn}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Check-in</span>
          </Button>
        </div>
      </div>

      {/* Active Scheduled Tasks (Pending Outreach) */}
      {scheduledTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-warning" />
            </span>
            <p className="text-2xs font-bold uppercase tracking-wider text-warning-text">
              Active Care Tasks ({scheduledTasks.length} Pending)
            </p>
          </div>

          <div className="space-y-2.5">
            {scheduledTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-warning-soft border border-warning-border space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckInReasonBadge reason={task.reason} size="sm" />
                    <CheckInStatusBadge status={task.status} size="sm" />
                  </div>
                  {task.scheduledFor && (
                    <span className="text-2xs text-fg-muted flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(task.scheduledFor).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {task.notes && (
                  <div className="text-xs text-fg bg-surface p-3 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-2xs font-semibold text-fg-muted">
                      <FileText className="w-3 h-3" />
                      Outreach Instructions / Context:
                    </div>
                    <p className="whitespace-pre-wrap">{task.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <div className="flex items-center gap-3 text-2xs text-fg-muted flex-wrap">
                    {task.createdBy && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Flagged by:{" "}
                        <span className="text-fg font-medium">
                          {task.createdBy.firstName} {task.createdBy.lastName}
                        </span>
                      </span>
                    )}
                    {task.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Assigned:{" "}
                        <span className="text-fg font-medium">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-2xs h-7 text-danger-text hover:bg-danger-soft gap-1"
                      onClick={() => onCancelCheckIn(task.id)}
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-2xs h-7 gap-1"
                      onClick={() => onCompleteCheckIn(task)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete Task
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit History Timeline */}
      <div className="space-y-3">
        <p className="text-2xs font-bold uppercase tracking-wider text-fg-muted">
          Pastoral Audit History ({completedHistory.length} Interactions)
        </p>

        {completedHistory.length > 0 ? (
          <div className="space-y-3">
            {completedHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckInReasonBadge reason={item.reason} size="sm" />
                    <CheckInStatusBadge status={item.status} size="sm" />
                  </div>
                  <span className="text-2xs text-fg-muted font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleString()
                      : new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Conversation Notes */}
                {item.notes && (
                  <div className="text-xs text-fg bg-subtle p-3 rounded-lg border border-border-subtle">
                    <p className="text-2xs font-semibold text-fg-muted mb-1">
                      Conversation Notes:
                    </p>
                    <p className="whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}

                {/* Outcome Block */}
                {item.outcome && (
                  <div className="p-3 rounded-lg bg-success-soft border border-success-border/60 text-fg">
                    <div className="flex items-center gap-1.5 text-2xs font-semibold text-success-text mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Outcome & Resolution:
                    </div>
                    <p className="text-xs whitespace-pre-wrap">
                      {item.outcome}
                    </p>
                  </div>
                )}

                {/* Audit Attribution */}
                <div className="flex items-center justify-between text-2xs text-fg-muted pt-1 border-t border-border-subtle flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {item.createdBy && (
                      <span>
                        Logged by:{" "}
                        <span className="text-fg font-medium">
                          {item.createdBy.firstName} {item.createdBy.lastName}
                        </span>
                      </span>
                    )}
                    {item.assignedTo && (
                      <span>
                        Assigned to:{" "}
                        <span className="text-fg font-medium">
                          {item.assignedTo.firstName} {item.assignedTo.lastName}
                        </span>
                      </span>
                    )}
                  </div>
                  <span>
                    Audit record created:{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : scheduledTasks.length === 0 ? (
          <div className="p-6 text-center bg-subtle border border-border-subtle rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-success-soft text-success-text flex items-center justify-center mx-auto">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-fg text-xs">
                Member is Healthy & Up-to-Date
              </p>
              <p className="text-2xs text-fg-muted max-w-sm mx-auto">
                Members and workers are healthy by default. No active outreach
                tasks or check-in history logged.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={onScheduleCare}
              >
                <Clock className="w-3.5 h-3.5 text-warning-text" />
                <span>Flag for Care</span>
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="gap-1 text-xs"
                onClick={onLogCheckIn}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Check-in</span>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
