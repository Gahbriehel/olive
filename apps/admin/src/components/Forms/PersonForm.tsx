"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/FormElements/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials } from "@/utils/formatters";
import { peopleService } from "@/services/people.service";
import {
  IPerson,
  IPersonPayload,
  ApiGender,
  ApiMembershipStatus,
  reverseMembershipMap,
} from "@/models/person";
import { cn } from "@/helpers/cn";

export interface PersonFormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: ApiGender;
  membershipStatus: ApiMembershipStatus;
  dateOfBirth?: string;
  address?: string;
}

export interface PersonFormProps {
  initialValues?: IPerson | Partial<IPersonPayload & { id?: string }>;
  onSubmit: (payload: IPersonPayload) => void | Promise<void>;
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

function resolveMembershipStatus(
  initial?: IPerson | Partial<IPersonPayload & { id?: string }>,
): ApiMembershipStatus {
  if (!initial) return "VISITOR";
  const person = initial as IPerson;
  if (person.raw?.membershipStatus) return person.raw.membershipStatus;
  if (person.rawMembershipStatus) return person.rawMembershipStatus;
  if (
    initial.membershipStatus &&
    initial.membershipStatus in reverseMembershipMap
  ) {
    return reverseMembershipMap[
      initial.membershipStatus as keyof typeof reverseMembershipMap
    ];
  }
  if (
    initial.membershipStatus &&
    ["VISITOR", "MEMBER", "WORKER", "LEADER"].includes(initial.membershipStatus)
  ) {
    return initial.membershipStatus as ApiMembershipStatus;
  }
  return "VISITOR";
}

function resolveGender(
  initial?: IPerson | Partial<IPersonPayload & { id?: string }>,
): ApiGender {
  if (!initial) return "MALE";
  const person = initial as IPerson;
  if (person.raw?.gender) return person.raw.gender;
  if (person.rawGender) return person.rawGender;
  if (initial.gender === "Female") return "FEMALE";
  if (initial.gender && ["MALE", "FEMALE", "OTHER"].includes(initial.gender)) {
    return initial.gender as ApiGender;
  }
  return "MALE";
}

function resolveDob(
  initial?: IPerson | Partial<IPersonPayload & { id?: string }>,
): string {
  if (!initial) return "";
  const person = initial as IPerson;
  if (person.raw?.dateOfBirth) {
    return new Date(person.raw.dateOfBirth).toISOString().slice(0, 10);
  }
  if (person.dateOfBirth) return person.dateOfBirth;
  if (person.dob && person.dob !== "N/A") return person.dob;
  return "";
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = Boolean(
    initialValues && "id" in initialValues && initialValues.id,
  );
  const person = isEditing ? (initialValues as IPerson) : null;
  const personId = person?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // When editing, fetch fresh details from backend if needed
  const { data: fullPerson } = useQuery({
    queryKey: ["person", personId],
    queryFn: () => (personId ? peopleService.getPersonById(personId) : null),
    initialData: person?.raw,
    staleTime: 1000 * 60,
    enabled: Boolean(isEditing && personId),
  });

  const { control, handleSubmit, reset, formState } = useForm<PersonFormValues>(
    {
      defaultValues: {
        firstName: initialValues?.firstName || "",
        lastName: initialValues?.lastName || "",
        email:
          (person?.raw?.email ??
            (initialValues?.email && initialValues.email !== "N/A"
              ? initialValues.email
              : "")) ||
          "",
        phone:
          (person?.raw?.phone ??
            (initialValues?.phone && initialValues.phone !== "N/A"
              ? initialValues.phone
              : "")) ||
          "",
        gender: resolveGender(initialValues),
        membershipStatus: resolveMembershipStatus(initialValues),
        dateOfBirth: resolveDob(initialValues),
        address: person?.raw?.address || initialValues?.address || "",
      },
    },
  );

  // Keep form updated when fresh details arrive in edit mode
  useEffect(() => {
    if (fullPerson && isEditing) {
      reset({
        firstName: fullPerson.firstName || "",
        lastName: fullPerson.lastName || "",
        email: fullPerson.email || "",
        phone: fullPerson.phone || "",
        gender: fullPerson.gender || resolveGender(initialValues),
        membershipStatus:
          fullPerson.membershipStatus || resolveMembershipStatus(initialValues),
        dateOfBirth: fullPerson.dateOfBirth
          ? new Date(fullPerson.dateOfBirth).toISOString().slice(0, 10)
          : resolveDob(initialValues),
        address: fullPerson.address || "",
      });
    }
  }, [fullPerson, isEditing, initialValues, reset]);

  const onFormSubmit = async (data: PersonFormValues) => {
    try {
      setIsSubmitting(true);
      const payload: IPersonPayload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        gender: data.gender,
        membershipStatus: data.membershipStatus,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address?.trim() || undefined,
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
        {/* Person Identity Card (Edit Mode) */}
        {isEditing && person && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(
                  person.name || `${person.firstName} ${person.lastName}`,
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {person.name || `${person.firstName} ${person.lastName}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={person.membershipStatus} size="sm" />
                  <span className="text-[10px] text-slate-400">
                    ID: {person.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First & Last Name Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="firstName"
            control={control}
            rules={{
              required: "First name is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            }}
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

          <Controller
            name="lastName"
            control={control}
            rules={{
              required: "Last name is required",
              maxLength: { value: 100, message: "Max 100 characters" },
            }}
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
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email format",
              },
            }}
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
        </div>

        {/* Membership Status & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      opt.value._id as
                        "VISITOR" | "MEMBER" | "WORKER" | "LEADER",
                    )
                  }
                  onBlur={onBlur}
                  options={MEMBERSHIP_OPTIONS}
                  validationError={error}
                />
              );
            }}
          />

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
        </div>

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
          text={
            isPending
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Person"
          }
          loading={isPending}
          disabled={isPending}
          color="primary"
        />
      </fieldset>
    </form>
  );
};
