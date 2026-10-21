"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Select } from "@/components/FormElements/Select";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials } from "@/utils/formatters";
import { useUsers } from "@/hooks/useUsers";
import {
  scheduleCareCheckInSchema,
  type ScheduleCareCheckInFormValues,
} from "./schemas/checkInSchema";
import {
  CHECK_IN_REASONS,
  CHECK_IN_REASON_DESCRIPTIONS,
  type CheckInReason,
} from "@/models/checkIn";
import { IPerson } from "@/models/person";
import { InfoTip } from "@/components/ui/InfoTip";

export type { ScheduleCareCheckInFormValues };

interface ScheduleCareFormProps {
  person: IPerson;
  onSubmit: (data: ScheduleCareCheckInFormValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ScheduleCareForm: React.FC<ScheduleCareFormProps> = ({
  person,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { users } = useUsers();

  const { control, handleSubmit, formState } =
    useForm<ScheduleCareCheckInFormValues>({
      resolver: yupResolver(scheduleCareCheckInSchema),
      mode: "onTouched",
      defaultValues: {
        reason: "ABSENTEEISM",
        assignedToId: "",
        scheduledFor: "",
        notes: "",
      },
    });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Member Profile Summary */}
      <div className="p-3.5 rounded-2xl bg-warning-soft border border-warning-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-text text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(person.name)}
          </div>
          <div>
            <p className="text-xs font-bold text-fg">{person.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={person.membershipStatus} size="sm" />
              <span className="text-2xs text-warning-text font-semibold">
                Scheduled Outreach Task
              </span>
            </div>
          </div>
        </div>
        {(person.phone !== "N/A" || person.email !== "N/A") && (
          <div className="text-right text-2xs text-fg-muted hidden sm:block">
            {person.phone !== "N/A" && <p>{person.phone}</p>}
            {person.email !== "N/A" && (
              <p className="truncate max-w-[160px]">{person.email}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Care Reason */}
        <Controller
          name="reason"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              {...field}
              label="Care Concern / Reason"
              descriptions={CHECK_IN_REASON_DESCRIPTIONS}
              required
              error={error?.message}
            >
              {(Object.keys(CHECK_IN_REASONS) as CheckInReason[]).map(
                (reasonKey) => {
                  const item = CHECK_IN_REASONS[reasonKey];
                  return (
                    <option key={reasonKey} value={reasonKey}>
                      {item.label}
                    </option>
                  );
                },
              )}
            </Select>
          )}
        />

        {/* Assigned Pastor / Leader */}
        <Controller
          name="assignedToId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              {...field}
              label="Assign To (Optional)"
              hint="Leave unassigned to add this to the open pastoral queue."
              error={error?.message}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          )}
        />

        {/* Target Outreach Date */}
        <Controller
          name="scheduledFor"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="datetime-local"
              label="Scheduled Outreach Date (Optional)"
              error={error?.message}
            />
          )}
        />

        {/* Instructions / Concern notes */}
        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Care Concern & Outreach Instructions"
              placeholder="e.g. Missed 3 Sundays"
              labelSuffix={
                <InfoTip label="See example">
                  Has missed 3 consecutive Sunday services. Please check in on
                  well-being and family.
                </InfoTip>
              }
              rows={4}
              required
              error={error?.message}
            />
          )}
        />
      </div>

      <FormFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          Schedule Outreach
        </Button>
      </FormFooter>
    </form>
  );
};
