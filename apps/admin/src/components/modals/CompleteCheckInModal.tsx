"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, Clock, Calendar, User, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/FormElements/TextArea";
import { CheckInReasonBadge } from "@/components/ui/CheckInBadges";
import {
  completeCheckInSchema,
  type CompleteCheckInFormValues,
} from "@/components/Forms/schemas/checkInSchema";
import type { IPastoralCheckIn } from "@/models/checkIn";
import { InfoTip } from "@/components/ui/InfoTip";

interface CompleteCheckInModalProps {
  checkIn: IPastoralCheckIn | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (checkInId: string, outcome: string) => Promise<void>;
  isLoading?: boolean;
}

export const CompleteCheckInModal: React.FC<CompleteCheckInModalProps> = ({
  checkIn,
  isOpen,
  onClose,
  onComplete,
  isLoading = false,
}) => {
  const { control, handleSubmit, formState, reset } =
    useForm<CompleteCheckInFormValues>({
      resolver: yupResolver(completeCheckInSchema),
      mode: "onTouched",
      defaultValues: {
        outcome: "",
      },
    });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: CompleteCheckInFormValues) => {
    if (!checkIn) return;
    await onComplete(checkIn.id, values.outcome);
    handleClose();
  };

  if (!checkIn) return null;

  const isPending = isLoading || formState.isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Pastoral Check-in"
      description="Record the conversation outcome and mark this scheduled outreach task as completed."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Scheduled Task Context Card */}
        <div className="p-4 rounded-xl bg-subtle border border-border space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckInReasonBadge reason={checkIn.reason} size="sm" />
              <span className="text-2xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-warning-text" />
                Scheduled Task
              </span>
            </div>
            {checkIn.scheduledFor && (
              <span className="text-2xs text-fg-muted flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                Due: {new Date(checkIn.scheduledFor).toLocaleDateString()}
              </span>
            )}
          </div>

          {checkIn.notes && (
            <div className="text-xs text-fg bg-surface p-3 rounded-lg border border-border-subtle space-y-1">
              <div className="flex items-center gap-1.5 text-2xs font-semibold text-fg-muted">
                <FileText className="w-3 h-3" />
                Outreach Instructions / Concern:
              </div>
              <p className="whitespace-pre-wrap">{checkIn.notes}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-2xs text-fg-muted flex-wrap pt-1">
            {checkIn.createdBy && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Created by:{" "}
                <span className="text-fg font-medium">
                  {checkIn.createdBy.firstName} {checkIn.createdBy.lastName}
                </span>
              </span>
            )}
            {checkIn.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Assigned to:{" "}
                <span className="text-fg font-medium">
                  {checkIn.assignedTo.firstName} {checkIn.assignedTo.lastName}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Outcome Input */}
        <Controller
          name="outcome"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Outreach Outcome & Discussion Summary"
              placeholder="e.g. Spoke by phone"
              labelSuffix={
                <InfoTip label="See example">
                  Spoke on the phone. Was traveling for work; attending this
                  Sunday. Encouraged and prayed together.
                </InfoTip>
              }
              rows={4}
              required
              error={error?.message}
            />
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
