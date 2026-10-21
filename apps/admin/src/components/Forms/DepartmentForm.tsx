"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Button, DeleteButton } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import {
  departmentSchema,
  type DepartmentFormValues,
} from "./schemas/departmentSchema";

export type { DepartmentFormValues };

interface DepartmentFormProps {
  initialValues?: Partial<DepartmentFormValues> & { id?: string };
  onSubmit: (data: DepartmentFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
}) => {
  const isEditing = Boolean(initialValues?.id || onDelete);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const { control, handleSubmit, formState } = useForm<DepartmentFormValues>({
    resolver: yupResolver(departmentSchema),
    mode: "onTouched",
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
  });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const onFormSubmit = async (data: DepartmentFormValues) => {
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
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Department Name */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Department Name"
              placeholder="e.g. Media & Tech, Choir, Ushers"
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
              placeholder="Responsibilities and focus"
              rows={4}
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
              title="Delete Department"
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
          {isEditing ? "Save changes" : "Create Department"}
        </Button>
      </FormFooter>
    </form>
  );
};
