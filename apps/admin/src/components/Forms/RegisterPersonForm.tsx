"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/FormElements/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton } from "@/components/ui/Button";
import { IRegistrationPayload } from "@/models/registration";
import { cn } from "@/helpers/cn";

export interface RegisterPersonFormValues {
  eventId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
}

interface RegisterPersonFormProps {
  events: { id: string; title: string }[];
  defaultEventId?: string;
  onSubmit: (
    eventId: string,
    payload: IRegistrationPayload,
  ) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const GENDER_OPTIONS: ISelect[] = [
  { value: { _id: "MALE" }, label: "Male" },
  { value: { _id: "FEMALE" }, label: "Female" },
  { value: { _id: "OTHER" }, label: "Other" },
];

export const RegisterPersonForm: React.FC<RegisterPersonFormProps> = ({
  events,
  defaultEventId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventOptions: ISelect[] = events.map((e) => ({
    value: { _id: e.id },
    label: e.title,
  }));

  const initialEventId =
    defaultEventId || (events.length > 0 ? events[0].id : "");

  const { control, handleSubmit, formState } =
    useForm<RegisterPersonFormValues>({
      defaultValues: {
        eventId: initialEventId,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dateOfBirth: "",
      },
    });

  const onFormSubmit = async (data: RegisterPersonFormValues) => {
    try {
      setIsSubmitting(true);
      const { eventId, ...payload } = data;
      await onSubmit(eventId, payload);
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
        {/* Event Selection */}
        <Controller
          name="eventId"
          control={control}
          rules={{ required: "Target event is required" }}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            const selectedOpt =
              eventOptions.find((opt) => opt.value._id === value) ||
              eventOptions[0];

            return (
              <Select
                label="Target Event"
                value={
                  selectedOpt || { value: { _id: "" }, label: "Select Event" }
                }
                onChange={(opt) => onChange(opt.value._id as string)}
                onBlur={onBlur}
                options={eventOptions}
                validationError={error}
              />
            );
          }}
        />

        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
          rules={{ required: "First name is required" }}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="First Name"
              placeholder="e.g. John"
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
              placeholder="e.g. Doe"
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
              placeholder="john.doe@example.com"
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
          text="Register Person"
          loading={isPending}
          disabled={isPending}
          color="primary"
        />
      </fieldset>
    </form>
  );
};
