"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton, DeleteButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminUser } from "@/models/dashboard";
import { cn } from "@/helpers/cn";

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
  initialValues?: Partial<AdminUser>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onFormSubmit = async (data: UserFormValues) => {
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
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* First & Last Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="firstName"
            control={control}
            rules={{ required: "First name is required" }}
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
            rules={{ required: "Last name is required" }}
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
          rules={{
            required: "Email address is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address format",
            },
          }}
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
          rules={{ required: "Role assignment is required" }}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Status
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    initialValues?.status === "Active" ? "emerald" : "slate"
                  }
                  dot
                >
                  {initialValues?.status || "Active"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Password (Optional for Edit, Optional/Recommended for Create) */}
        <Controller
          name="password"
          control={control}
          rules={
            !isEditing
              ? {
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }
              : undefined
          }
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

      {/* Action Buttons Footer */}
      <fieldset
        className={cn(
          "grid h-20 grid-cols-2 gap-4 border-t border-slate-200 dark:border-zinc-800 p-4",
        )}
      >
        {isEditing ? (
          <>
            <DeleteButton
              text="Delete User"
              title="Delete User Account"
              onClick={handlePerformDelete}
              loading={isDeletingPending}
            />
            <BaseButton
              type="submit"
              text="Save Changes"
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
              text="Create User"
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
