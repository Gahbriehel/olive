"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Sparkles } from "lucide-react";
import { Select } from "@/components/FormElements/Select";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials } from "@/utils/formatters";
import {
  followUpSchema,
  FOLLOW_UP_STATUSES,
  type FollowUpFormValues,
} from "./schemas/followUpSchema";
import { IPerson } from "@/models/person";

export type { FollowUpFormValues };

interface FollowUpFormProps {
  person: IPerson;
  onSubmit: (data: FollowUpFormValues) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({
  person,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const defaultDate = person.lastFollowUpAt
    ? new Date(person.lastFollowUpAt).toISOString().slice(0, 16)
    : "";

  const { control, handleSubmit, formState, setValue } =
    useForm<FollowUpFormValues>({
      resolver: yupResolver(followUpSchema),
      mode: "onTouched",
      defaultValues: {
        followUpStatus: person.followUpStatus || "PENDING",
        followUpNotes: person.followUpNotes || "",
        lastFollowUpAt: defaultDate,
      },
    });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const handleSetNow = () => {
    const nowIso = new Date().toISOString().slice(0, 16);
    setValue("lastFollowUpAt", nowIso, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Visitor Profile Summary */}
      <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(person.name)}
          </div>
          <div>
            <p className="text-xs font-bold text-fg">{person.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={person.membershipStatus} size="sm" />
              <StatusBadge
                status={person.followUpStatus || "PENDING"}
                size="sm"
              />
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
        {/* Follow-up Status */}
        <Controller
          name="followUpStatus"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              {...field}
              label="Follow-up Status"
              required
              error={error?.message}
            >
              {FOLLOW_UP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "PENDING"
                    ? "Pending"
                    : status === "IN_PROGRESS"
                      ? "In Progress"
                      : status === "CONVERTED"
                        ? "Converted"
                        : "Inactive"}
                </option>
              ))}
            </Select>
          )}
        />

        {/* Date of contact */}
        <Controller
          name="lastFollowUpAt"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="datetime-local"
              label="Date & Time of Contact"
              hint={
                <button
                  type="button"
                  onClick={handleSetNow}
                  className="text-2xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Set to current time
                </button>
              }
              error={error?.message}
            />
          )}
        />

        {/* Notes */}
        <Controller
          name="followUpNotes"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Notes"
              placeholder="e.g. Spoke with visitor. Welcomed to the church, planning to attend Sunday service..."
              rows={5}
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
          Save changes
        </Button>
      </FormFooter>
    </form>
  );
};
