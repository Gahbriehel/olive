"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { cn } from "@/helpers/cn";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const { control, handleSubmit, setValue, watch, formState } =
    useForm<TeamFormValues>({
      defaultValues: {
        name: initialValues?.name || "",
        color: initialValues?.color || "#6366F1",
      },
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentColor = watch("color");

  const onFormSubmit = async (data: TeamFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
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
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Name */}
        <Controller
          name="name"
          control={control}
          rules={{ required: "Team name is required" }}
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

        {/* Color Picker & Presets */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Team Color <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <Controller
              name="color"
              control={control}
              rules={{ required: "Team color is required" }}
              render={({ field, fieldState: { error } }) => (
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value || "#6366F1"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 cursor-pointer p-1 bg-white dark:bg-zinc-800"
                    />
                    <Input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#6366F1"
                      className="font-mono"
                      error={error?.message}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setValue("color", preset.hex)}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform flex items-center justify-center border-2",
                  currentColor === preset.hex
                    ? "scale-110 border-slate-900 dark:border-white shadow-md"
                    : "border-transparent hover:scale-105",
                )}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              />
            ))}
          </div>
        </div>
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
              title="Delete Team"
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
