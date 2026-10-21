"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Select } from "@/components/FormElements/Select";
import { TextArea } from "@/components/FormElements/TextArea";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials } from "@/utils/formatters";
import {
  immediateLogCheckInSchema,
  type ImmediateLogCheckInFormValues,
} from "./schemas/checkInSchema";
import { CHECK_IN_REASONS, type CheckInReason } from "@/models/checkIn";
import { IPerson } from "@/models/person";

export type { ImmediateLogCheckInFormValues };

interface LogCheckInFormProps {
  person: IPerson;
  onSubmit: (data: ImmediateLogCheckInFormValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LogCheckInForm: React.FC<LogCheckInFormProps> = ({
  person,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { control, handleSubmit, formState } =
    useForm<ImmediateLogCheckInFormValues>({
      resolver: yupResolver(immediateLogCheckInSchema),
      mode: "onTouched",
      defaultValues: {
        reason: "GENERAL_CHECK_IN",
        notes: "",
        outcome: "",
      },
    });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Member Profile Summary */}
      <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(person.name)}
          </div>
          <div>
            <p className="text-xs font-bold text-fg">{person.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={person.membershipStatus} size="sm" />
              <span className="text-2xs text-fg-muted font-medium">
                Immediate Log (Completed)
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
        {/* Check-in Reason */}
        <Controller
          name="reason"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              {...field}
              label="Care Reason"
              required
              error={error?.message}
            >
              {(Object.keys(CHECK_IN_REASONS) as CheckInReason[]).map(
                (reasonKey) => {
                  const item = CHECK_IN_REASONS[reasonKey];
                  return (
                    <option key={reasonKey} value={reasonKey}>
                      {item.label} — {item.description}
                    </option>
                  );
                },
              )}
            </Select>
          )}
        />

        {/* Conversation Notes */}
        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Conversation Notes"
              placeholder="e.g. Hospital visit after minor surgery; checked in on health and family..."
              rows={4}
              required
              error={error?.message}
            />
          )}
        />

        {/* Outcome / Resolution */}
        <Controller
          name="outcome"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Outcome & Next Steps"
              placeholder="e.g. Recovering well at home. Church providing prayer support; attending this Sunday..."
              rows={3}
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
          Log Check-in
        </Button>
      </FormFooter>
    </form>
  );
};
