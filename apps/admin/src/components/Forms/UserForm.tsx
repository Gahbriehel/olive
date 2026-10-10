"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { Button, DeleteButton } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IAdminUser } from "@/models/dashboard";
import { userSchema } from "./schemas/userSchema";

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status?: "Active" | "Inactive";
  password?: string;
}

interface UserFormProps {
  initialValues?: Partial<IAdminUser>;
  onSubmit: (data: UserFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

const ROLE_OPTIONS: ISelect[] = [
  // { value: { _id: "SUPER_ADMIN" }, label: "Super Admin (System-Wide)" },
  { value: { _id: "ADMIN" }, label: "Church Admin" },
  { value: { _id: "COORDINATOR" }, label: "Event Coordinator" },
  { value: { _id: "REGISTRATION_DESK" }, label: "Registration Desk" },
  { value: { _id: "MEMBER" }, label: "Member" },
];

export const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
}) => {
  const isEditing = Boolean(initialValues?.id || onDelete);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const defaultFirstName =
    initialValues?.firstName ||
    (initialValues?.name ? initialValues.name.split(" ")[0] : "");
  const defaultLastName =
    initialValues?.lastName ||
    (initialValues?.name
      ? initialValues.name.split(" ").slice(1).join(" ")
      : "");

  const { control, handleSubmit, formState } = useForm<UserFormValues>({
    resolver: yupResolver(userSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      role: initialValues?.role || "MEMBER",
      status: initialValues?.status || "Active",
      password: "",
    },
  });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const onFormSubmit = async (data: UserFormValues) => {
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
      <div className="space-y-4">
        {/* First & Last Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="First Name"
                placeholder="e.g. Alex"
                required
                error={error?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Last Name"
                placeholder="e.g. Morgan"
                required
                error={error?.message}
              />
            )}
          />
        </div>

        {/* Email Address */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="email"
              label="Email Address"
              placeholder="alex.morgan@example.com"
              required
              error={error?.message}
            />
          )}
        />

        {/* Phone Number */}
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="tel"
              label="Phone Number"
              placeholder="+1 (555) 019-2834"
              error={error?.message}
            />
          )}
        />

        {/* System Role Selection */}
        <Controller
          name="role"
          control={control}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            const selectedOpt =
              ROLE_OPTIONS.find((opt) => opt.value._id === value) ||
              ROLE_OPTIONS[4];

            return (
              <Select
                label="Assign System Role"
                value={selectedOpt}
                onChange={(opt) => onChange(opt.value._id as string)}
                onBlur={onBlur}
                options={ROLE_OPTIONS}
                validationError={error}
              />
            );
          }}
        />

        {/* Account Status */}
        {isEditing && (
          <div>
            <label className="block text-xs font-semibold text-fg-secondary mb-1.5">
              Account Status
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-subtle border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <StatusBadge status={initialValues?.status || "Active"} />
              </div>
            </div>
          </div>
        )}

        {/* Password (Optional for Edit, Optional/Recommended for Create) */}
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="password"
              label={
                isEditing
                  ? "Reset Password (Optional)"
                  : "Account Password (Optional)"
              }
              placeholder={
                isEditing
                  ? "Leave blank to keep unchanged"
                  : "Set initial password..."
              }
              error={error?.message}
            />
          )}
        />
      </div>

      <FormFooter
        destructive={
          isEditing && onDelete ? (
            <DeleteButton
              text="Delete User"
              title="Delete User Account"
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
          {isEditing ? "Save changes" : "Invite user"}
        </Button>
      </FormFooter>
    </form>
  );
};
