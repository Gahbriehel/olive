"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton } from "@/components/ui/Button";
import {
  ICreatePersonPayload,
  ApiGender,
  ApiMembershipStatus,
} from "@/models/person";
import { cn } from "@/helpers/cn";

export interface AddPersonFormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ApiGender;
  membershipStatus?: ApiMembershipStatus;
  dateOfBirth?: string;
  address?: string;
}

interface AddPersonFormProps {
  onSubmit: (payload: ICreatePersonPayload) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const GENDER_OPTIONS: ISelect[] = [
  { value: { _id: "MALE" }, label: "Male" },
  { value: { _id: "FEMALE" }, label: "Female" },
  { value: { _id: "OTHER" }, label: "Other" },
];

const MEMBERSHIP_OPTIONS: ISelect[] = [
  { value: { _id: "VISITOR" }, label: "Visitor" },
  { value: { _id: "MEMBER" }, label: "Member" },
  { value: { _id: "WORKER" }, label: "Worker" },
  { value: { _id: "LEADER" }, label: "Leader" },
];

export const AddPersonForm: React.FC<AddPersonFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState } = useForm<AddPersonFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      membershipStatus: "VISITOR",
      dateOfBirth: "",
      address: "",
    },
  });

  const onFormSubmit = async (data: AddPersonFormValues) => {
    try {
      setIsSubmitting(true);
      const payload: ICreatePersonPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        gender: data.gender,
        membershipStatus: data.membershipStatus,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isLoading || isSubmitting || formState.isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col h-full space-y-5 p-1"
    >
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
          rules={{ required: "First name is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="First Name"
              placeholder="e.g. Jane"
              required
              error={error?.message}
            />
          )}
        />

        {/* Last Name */}
        <Controller
          name="lastName"
          control={control}
          rules={{ required: "Last name is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Last Name"
              placeholder="e.g. Smith"
              required
              error={error?.message}
            />
          )}
        />

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="email"
              label="Email Address"
              placeholder="jane.smith@example.com"
              error={error?.message}
            />
          )}
        />

        {/* Phone */}
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="tel"
              label="Phone Number"
              placeholder="+1 555-0199"
              error={error?.message}
            />
          )}
        />

        {/* Membership Status */}
        <Controller
          name="membershipStatus"
          control={control}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            const selectedOpt =
              MEMBERSHIP_OPTIONS.find((opt) => opt.value._id === value) ||
              MEMBERSHIP_OPTIONS[0];

            return (
              <Select
                label="Membership Category"
                value={selectedOpt}
                onChange={(opt) =>
                  onChange(
                    opt.value._id as "VISITOR" | "MEMBER" | "WORKER" | "LEADER",
                  )
                }
                onBlur={onBlur}
                options={MEMBERSHIP_OPTIONS}
                validationError={error}
              />
            );
          }}
        />

        {/* Gender */}
        <Controller
          name="gender"
          control={control}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            const selectedOpt =
              GENDER_OPTIONS.find((opt) => opt.value._id === value) ||
              GENDER_OPTIONS[0];

            return (
              <Select
                label="Gender"
                value={selectedOpt}
                onChange={(opt) =>
                  onChange(opt.value._id as "MALE" | "FEMALE" | "OTHER")
                }
                onBlur={onBlur}
                options={GENDER_OPTIONS}
                validationError={error}
              />
            );
          }}
        />

        {/* Date of Birth */}
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              type="date"
              label="Date of Birth"
              error={error?.message}
            />
          )}
        />

        {/* Address */}
        <Controller
          name="address"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Home Address"
              placeholder="123 Grace Way, Suite 100"
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
        <BaseButton
          type="button"
          color="outline"
          text="Cancel"
          onClick={onCancel}
          disabled={isPending}
        />
        <BaseButton
          type="submit"
          text="Add Person"
          loading={isPending}
          disabled={isPending}
          color="primary"
        />
      </fieldset>
    </form>
  );
};
