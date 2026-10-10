"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { IRegistrationPayload } from "@/models/registration";
import {
  registerPersonSchema,
  type RegisterPersonFormValues,
} from "@/components/Forms/schemas/registerPersonSchema";

export type { RegisterPersonFormValues };

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

const NO_EVENT: ISelect = { value: { _id: "" }, label: "Select event" };

export const RegisterPersonForm: React.FC<RegisterPersonFormProps> = ({
  events,
  defaultEventId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const eventOptions: ISelect[] = events.map((e) => ({
    value: { _id: e.id },
    label: e.title,
  }));

  const fallbackEventId = defaultEventId || events[0]?.id || "";

  const { control, handleSubmit, formState, getValues, resetField } = useForm({
    resolver: yupResolver(registerPersonSchema),
    mode: "onTouched",
    defaultValues: {
      eventId: fallbackEventId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
    },
  });

  // Events can arrive after mount: preselect the default once they do, as
  // the field's default so it neither shows one event while holding another
  // nor marks the form dirty.
  useEffect(() => {
    if (!getValues("eventId") && fallbackEventId) {
      resetField("eventId", { defaultValue: fallbackEventId });
    }
  }, [fallbackEventId, getValues, resetField]);

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const onFormSubmit = async (data: RegisterPersonFormValues) => {
    const { eventId, ...payload } = data;
    await onSubmit(eventId, payload);
  };

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <div className="space-y-4">
        {/* Event Selection */}
        <Controller
          name="eventId"
          control={control}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <Select
              label="Target Event"
              required
              value={
                eventOptions.find((opt) => opt.value._id === value) ?? NO_EVENT
              }
              onChange={(opt) => onChange(opt.value._id as string)}
              onBlur={onBlur}
              options={eventOptions}
              validationError={error}
            />
          )}
        />

        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
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

      <FormFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isPending} variant="primary">
          Register attendee
        </Button>
      </FormFooter>
    </form>
  );
};
