"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/FormElements/Input";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";

export interface GameFormValues {
  name: string;
  description?: string;
  maxScore: number;
}

interface GamesFormProps {
  initialValues?: Partial<GameFormValues> & { id?: string };
  onSubmit: (data: GameFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export const GamesForm: React.FC<GamesFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
}) => {
  const isEditing = Boolean(initialValues?.id || onDelete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const { control, handleSubmit, formState } = useForm<GameFormValues>({
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      maxScore: initialValues?.maxScore ?? 100,
    },
  });

  const onFormSubmit = async (data: GameFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        maxScore: Number(data.maxScore) || 100,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePerformDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeletingState(true);
      await onDelete();
    } finally {
      setIsDeletingState(false);
    }
  };

  const isPending = isLoading || isSubmitting || formState.isSubmitting;
  const isDeletingPending = isDeleting || isDeletingState;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col h-full space-y-5 p-1"
    >
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Name */}
        <Controller
          name="name"
          control={control}
          rules={{ required: "Game name is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Game Name"
              placeholder="e.g. Tug of War"
              required
              error={error?.message}
            />
          )}
        />

        {/* Max Score */}
        <Controller
          name="maxScore"
          control={control}
          rules={{
            required: "Max score is required",
            min: { value: 1, message: "Max score must be at least 1" },
          }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="number"
              label="Maximum Score / Points"
              placeholder="e.g. 100"
              required
              error={error?.message}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Description"
              placeholder="Brief rules or description..."
              error={error?.message}
            />
          )}
        />
      </div>

      {/* Footer Buttons */}
      <fieldset
        className={cn(
          "grid h-20 grid-cols-2 gap-4 border-t border-slate-200 dark:border-zinc-800 p-4",
        )}
      >
        {isEditing ? (
          <>
            <DeleteButton
              text="Delete"
              title="Delete Game"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
            />
            <BaseButton
              type="submit"
              text="Submit"
              loading={isPending}
              disabled={isPending || isDeletingPending}
              color="primary"
            />
          </>
        ) : (
          <>
            <BaseButton
              type="button"
              color="outline"
              text="Cancel"
              onClick={onCancel}
              disabled={isPending}
            />
            <BaseButton
              type="submit"
              text="Submit"
              loading={isPending}
              disabled={isPending}
              color="primary"
            />
          </>
        )}
      </fieldset>
    </form>
  );
};
