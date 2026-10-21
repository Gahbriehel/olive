"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  User,
  Calendar,
  CheckCircle2,
  FileText,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckInReasonBadge } from "@/components/ui/CheckInBadges";
import { Select } from "@/components/FormElements/Select";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useAuth } from "@/hooks/useAuth";
import {
  CHECK_IN_REASONS,
  type CheckInReason,
  type IPastoralCheckIn,
} from "@/models/checkIn";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface GlobalCheckInQueueProps {
  onCompleteTask: (task: IPastoralCheckIn) => void;
  onCancelTask: (taskId: string) => void;
  onSelectPersonById: (personId: string) => void;
}

export function GlobalCheckInQueue({
  onCompleteTask,
  onCancelTask,
  onSelectPersonById,
}: GlobalCheckInQueueProps) {
  const { user } = useAuth();
  const [activeQueueTab, setActiveQueueTab] = useState<"all" | "my">("all");
  const [selectedReason, setSelectedReason] = useState<string>("");

  const queryParams = useMemo(() => {
    return {
      status: "SCHEDULED" as const,
      assignedToId: activeQueueTab === "my" ? user?.id : undefined,
      reason: selectedReason ? (selectedReason as CheckInReason) : undefined,
    };
  }, [activeQueueTab, user?.id, selectedReason]);

  const { checkIns, isLoading, refetch } = useCheckIns(queryParams);

  const tabs: TabItem[] = [
    {
      id: "all",
      label: "All Pending Tasks",
      icon: <Clock className="w-3.5 h-3.5" />,
      count: activeQueueTab === "all" ? checkIns.length : undefined,
    },
    {
      id: "my",
      label: "My Assigned Tasks",
      icon: <User className="w-3.5 h-3.5" />,
      count: activeQueueTab === "my" ? checkIns.length : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Queue Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <Tabs
          tabs={tabs}
          activeTab={activeQueueTab}
          onChange={(id) => setActiveQueueTab(id as "all" | "my")}
          label="Care Queue Filter"
        />

        <div className="flex items-center gap-2">
          <div className="w-48 sm:w-56">
            <Select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              aria-label="Filter by Reason"
            >
              <option value="">All Care Reasons</option>
              {(Object.keys(CHECK_IN_REASONS) as CheckInReason[]).map((key) => (
                <option key={key} value={key}>
                  {CHECK_IN_REASONS[key].label}
                </option>
              ))}
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="text-xs shrink-0"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-12 text-center text-fg-muted space-y-2">
          <Clock className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-xs">Loading care queue tasks...</p>
        </div>
      ) : checkIns.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-success-soft text-success-text flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-fg text-sm">
              {activeQueueTab === "my"
                ? "No tasks assigned to you"
                : "No pending pastoral outreach tasks"}
            </h4>
            <p className="text-xs text-fg-muted max-w-md mx-auto">
              {selectedReason
                ? "No pending tasks match the selected reason filter."
                : "All members and workers are currently up to date. Staff can schedule or flag care when outreach is needed."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {checkIns.map((task) => {
            const personName = task.person
              ? `${task.person.firstName} ${task.person.lastName}`
              : "Church Member";

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-colors space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {task.person?.id ? (
                        <button
                          type="button"
                          onClick={() => onSelectPersonById(task.person!.id)}
                          className="font-bold text-sm text-fg hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                        >
                          <span>{personName}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-fg-muted" />
                        </button>
                      ) : (
                        <p className="font-bold text-sm text-fg">
                          {personName}
                        </p>
                      )}
                      {task.person?.membershipStatus && (
                        <div className="mt-1">
                          <StatusBadge
                            status={task.person.membershipStatus}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <CheckInReasonBadge reason={task.reason} size="sm" />
                      {task.scheduledFor && (
                        <span className="text-2xs text-fg-muted flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          Due:{" "}
                          {new Date(task.scheduledFor).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.notes && (
                    <div className="p-3 rounded-xl bg-subtle border border-border-subtle text-xs text-fg space-y-1">
                      <div className="flex items-center gap-1 text-2xs font-semibold text-fg-muted">
                        <FileText className="w-3 h-3" />
                        Care Concern / Instructions:
                      </div>
                      <p className="whitespace-pre-wrap">{task.notes}</p>
                    </div>
                  )}

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
                        Assigned to:{" "}
                        <span className="text-fg font-medium">
                          {task.assignedTo.firstName} {task.assignedTo.lastName}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 text-danger-text hover:bg-danger-soft gap-1"
                    onClick={() => onCancelTask(task.id)}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => onCompleteTask(task)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete Check-in
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
