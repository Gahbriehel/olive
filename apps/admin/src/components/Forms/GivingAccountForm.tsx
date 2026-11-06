"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { TextArea } from "@/components/FormElements/TextArea";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { FormField, fieldAria, useFieldIds } from "@/components/ui/FormField";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { cn } from "@/helpers/cn";
import {
  GIVING_CURRENCIES,
  GIVING_PURPOSES,
  GivingAccount,
  GivingPurpose,
  CreateGivingAccountPayload,
} from "@/models/giving-account";
import {
  GivingAccountFormValues,
  givingAccountSchema,
  normalizeAccountNumber,
} from "./schemas/givingAccountSchema";

interface GivingAccountFormProps {
  account?: GivingAccount | null;
  onSubmit: (payload: CreateGivingAccountPayload) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const GivingAccountForm: React.FC<GivingAccountFormProps> = ({
  account,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = Boolean(account);
  const purposeIds = useFieldIds();

  const { control, handleSubmit, formState, trigger, getValues } =
    useForm<GivingAccountFormValues>({
      resolver: yupResolver(givingAccountSchema),
      mode: "onTouched",
      defaultValues: {
        label: account?.label ?? "",
        bankName: account?.bankName ?? "",
        accountName: account?.accountName ?? "",
        accountNumber: account?.accountNumber ?? "",
        currency: account?.currency ?? "NGN",
        note: account?.note ?? "",
        purposes: account?.purposes ?? [],
        isActive: account?.isActive ?? true,
      },
    });

  const { guard } = useUnsavedChangesGuard(
    formState.isDirty && !formState.isSubmitSuccessful,
  );

  const submit = async (values: GivingAccountFormValues) => {
    await onSubmit({
      label: values.label.trim(),
      bankName: values.bankName.trim(),
      accountName: values.accountName.trim(),
      accountNumber: normalizeAccountNumber(values.accountNumber),
      currency: values.currency as CreateGivingAccountPayload["currency"],
      note: values.note?.trim() ? values.note.trim() : null,
      purposes: values.purposes as GivingPurpose[],
      isActive: values.isActive,
    });
  };

  const isPending = isLoading || formState.isSubmitting;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="space-y-5">
        <Controller
          name="label"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Label"
              placeholder="e.g. Tithes & Offerings"
              hint="Shown to members as the account's title."
              required
              error={error?.message}
            />
          )}
        />

        <Controller
          name="bankName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Bank Name"
              placeholder="e.g. GTBank"
              required
              error={error?.message}
            />
          )}
        />

        <Controller
          name="accountName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Account Name"
              placeholder="e.g. Abiding Word Of Grace Missions"
              required
              error={error?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Select
                {...field}
                label="Currency"
                required
                error={error?.message}
                containerClassName="sm:col-span-1"
                onChange={(e) => {
                  field.onChange(e);
                  // The digit-count rule depends on the currency.
                  if (getValues("accountNumber")) {
                    void trigger("accountNumber");
                  }
                }}
              >
                {GIVING_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
          />
          <Controller
            name="accountNumber"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Account Number"
                inputMode="numeric"
                placeholder="0123456789"
                required
                error={error?.message}
                containerClassName="sm:col-span-2"
              />
            )}
          />
        </div>

        <Controller
          name="purposes"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const aria = fieldAria({
              errorId: purposeIds.errorId,
              hintId: purposeIds.hintId,
              error: error?.message,
            });
            const selected = (field.value ?? []) as string[];
            return (
              <FormField
                id={purposeIds.id}
                label="Purposes"
                required
                hint="What members can give towards with this account."
                hintId={purposeIds.hintId}
                error={error?.message}
                errorId={purposeIds.errorId}
              >
                <div
                  id={purposeIds.id}
                  role="group"
                  aria-label="Purposes"
                  className="flex flex-wrap gap-2"
                  {...aria}
                >
                  {GIVING_PURPOSES.map((p) => {
                    const on = selected.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          field.onChange(
                            on
                              ? selected.filter((s) => s !== p.id)
                              : [...selected, p.id],
                          );
                          field.onBlur();
                        }}
                        className={cn(
                          "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          on
                            ? "border-primary bg-primary-soft text-primary-text"
                            : "border-border-control bg-surface text-fg-secondary hover:bg-subtle",
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            );
          }}
        />

        <Controller
          name="note"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              value={field.value ?? ""}
              label="Note"
              rows={3}
              placeholder="Optional instructions shown with the account"
              error={error?.message}
            />
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label="Active"
              hint="Inactive accounts are hidden from the member app."
              color="emerald"
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
        <Button type="submit" variant="primary" loading={isPending}>
          {isEditing ? "Save changes" : "Add account"}
        </Button>
      </FormFooter>
    </form>
  );
};
