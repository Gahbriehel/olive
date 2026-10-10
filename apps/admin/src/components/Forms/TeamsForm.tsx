"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { Button, DeleteButton } from "@/components/ui/Button";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { cn } from "@/helpers/cn";
import { HEX_COLOR_PATTERN, teamSchema } from "./schemas/teamSchema";

export interface TeamFormValues {
  name: string;
  color: string;
}

interface TeamsFormProps {
  initialValues?: Partial<TeamFormValues> & { id?: string };
  onSubmit: (data: TeamFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const DEFAULT_COLOR = "#6366F1";

const PRESET_COLORS = [
  { name: "Indigo", hex: "#6366F1" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" },
];

export const TeamsForm: React.FC<TeamsFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
}) => {
  const isEditing = Boolean(initialValues?.id || onDelete);
  const [isDeletingState, setIsDeletingState] = useState(false);
  const colorIds = useFieldIds();

  const { control, handleSubmit, formState } = useForm<TeamFormValues>({
    resolver: yupResolver(teamSchema),
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name || "",
      color: initialValues?.color || DEFAULT_COLOR,
    },
  });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const onFormSubmit = async (data: TeamFormValues) => {
    await onSubmit(data);
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
      <div className="space-y-5">
        {/* Name */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Team Name"
              placeholder="e.g. Red Eagles"
              required
              error={error?.message}
            />
          )}
        />

        {/* Colour: picker, hex input and presets share one label + error */}
        <Controller
          name="color"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const aria = fieldAria({
              errorId: colorIds.errorId,
              hintId: colorIds.hintId,
              error: error?.message,
            });
            const pickerValue = HEX_COLOR_PATTERN.test(field.value)
              ? field.value
              : DEFAULT_COLOR;

            return (
              <FormField
                id={colorIds.id}
                label="Team Colour"
                required
                error={error?.message}
                errorId={colorIds.errorId}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Pick team colour"
                    value={pickerValue}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    {...aria}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-border-control bg-surface-raised p-1"
                  />
                  <input
                    ref={field.ref}
                    id={colorIds.id}
                    name={field.name}
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder={DEFAULT_COLOR}
                    aria-required
                    {...aria}
                    className={cn(
                      controlClass,
                      "font-mono",
                      error && controlErrorClass,
                    )}
                  />
                </div>

                <div
                  role="group"
                  aria-label="Preset colours"
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {PRESET_COLORS.map((preset) => {
                    const selected =
                      field.value?.toUpperCase() === preset.hex.toUpperCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          field.onChange(preset.hex);
                          field.onBlur();
                        }}
                        aria-label={`Use colour ${preset.name} ${preset.hex}`}
                        aria-pressed={selected}
                        title={preset.name}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          selected
                            ? "scale-110 border-fg shadow-md"
                            : "border-transparent hover:scale-105",
                        )}
                        style={{ backgroundColor: preset.hex }}
                      />
                    );
                  })}
                </div>
              </FormField>
            );
          }}
        />
      </div>

      <FormFooter
        destructive={
          isEditing && onDelete ? (
            <DeleteButton
              text="Delete"
              title="Delete Team"
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
          {isEditing ? "Save changes" : "Create team"}
        </Button>
      </FormFooter>
    </form>
  );
};
