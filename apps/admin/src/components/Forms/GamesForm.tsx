"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Button, DeleteButton } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { gameSchema, type GameSchemaValues } from "./schemas/gameSchema";

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
  const [isDeletingState, setIsDeletingState] = useState(false);

  const { control, handleSubmit, formState } = useForm<GameSchemaValues>({
    resolver: yupResolver(gameSchema),
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      maxScore: initialValues?.maxScore ?? 100,
    },
  });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const onFormSubmit = async (data: GameSchemaValues) => {
    await onSubmit({
      ...data,
      maxScore: Number(data.maxScore) || 100,
    });
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

  const isPending = isLoading || formState.isSubmitting;
  const isDeletingPending = isDeleting || isDeletingState;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="space-y-4">
        {/* Name */}
        <Controller
          name="name"
          control={control}
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
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
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
            <TextArea
              {...field}
              label="Description"
              placeholder="Brief rules or description..."
              error={error?.message}
            />
          )}
        />
      </div>

      <FormFooter
        destructive={
          isEditing && onDelete ? (
            <DeleteButton
              text="Delete"
              title="Delete Game"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
              disabled={isPending}
            />
          ) : undefined
        }
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          disabled={isDeletingPending}
        >
          {isEditing ? "Save changes" : "Create game"}
        </Button>
      </FormFooter>
    </form>
  );
};
