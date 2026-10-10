"use client";

import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { Input } from "@/components/FormElements/Input";
import { EmailBounce } from "@/models/emailBounce";
import { optionalText, requiredEmail, yup } from "@/models/validation";
import { useRemediateBounce } from "@/hooks/useEmailBounces";

interface RemediateBounceModalProps {
  bounce: EmailBounce | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RemediateFormValues {
  newEmail: string;
  subject: string;
  resendOriginal: boolean;
}

const buildSchema = (failingEmail: string) =>
  yup.object({
    newEmail: requiredEmail().test(
      "different-from-failing",
      "The new email must be different from the failing address.",
      (value) =>
        !value || value.toLowerCase() !== failingEmail.trim().toLowerCase(),
    ),
    subject: optionalText(),
    resendOriginal: yup.boolean().default(true),
  }) as yup.ObjectSchema<RemediateFormValues>;

export const RemediateBounceModal: React.FC<RemediateBounceModalProps> = ({
  bounce,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!bounce) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remediate & Fix Bounced Email"
      maxWidth="md"
    >
      <RemediateBounceForm
        bounce={bounce}
        onCancel={onClose}
        onDone={() => {
          onSuccess?.();
          onClose();
        }}
      />
    </Modal>
  );
};

/** Rendered inside the Modal so the unsaved-changes guard applies. */
function RemediateBounceForm({
  bounce,
  onCancel,
  onDone,
}: {
  bounce: EmailBounce;
  onCancel: () => void;
  onDone: () => void;
}) {
  const remediate = useRemediateBounce();
  const schema = useMemo(() => buildSchema(bounce.email), [bounce.email]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<RemediateFormValues>({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: { newEmail: "", subject: "", resendOriginal: true },
  });

  const { guard } = useUnsavedChangesGuard(isDirty);

  // API errors are toasted by the API client interceptor.
  const onSubmit = (values: RemediateFormValues) =>
    remediate.mutate(
      {
        id: bounce.id,
        payload: {
          newEmail: values.newEmail.trim().toLowerCase(),
          resendOriginal: values.resendOriginal,
          subject: values.subject.trim() || undefined,
        },
      },
      { onSuccess: onDone },
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 pt-1"
      noValidate
    >
      {/* Info Banner */}
      <div className="p-3.5 rounded-xl bg-subtle border border-border-control space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-fg-muted">Current Failing Address:</span>
          <span className="font-mono font-semibold text-danger-text">
            {bounce.email}
          </span>
        </div>
        {bounce.reason && (
          <div className="pt-2 border-t border-border-control">
            <span className="text-2xs font-bold uppercase text-slate-400 block mb-0.5">
              Failure Diagnostic
            </span>
            <p className="font-mono text-2xs text-fg-secondary truncate">
              {bounce.reason}
            </p>
          </div>
        )}
      </div>

      {/* New Email Input */}
      <Controller
        name="newEmail"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="email"
            label="Corrected Email Address"
            placeholder="e.g. correct.email@example.com"
            error={errors.newEmail?.message}
            required
            autoFocus
          />
        )}
      />

      {/* Optional Custom Subject */}
      <Controller
        name="subject"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            label="Custom Subject Line (Optional)"
            placeholder="Leave blank to use original email subject"
            error={errors.subject?.message}
          />
        )}
      />

      {/* Options */}
      <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
        <Controller
          name="resendOriginal"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                name={field.name}
                ref={field.ref}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
              />
              <div>
                <span className="font-semibold text-fg">
                  Resend original email to corrected address
                </span>
                <p className="text-2xs text-fg-subtle">
                  Automatically delivers the pending message (e.g., ticket QR
                  code or confirmation) to the new email.
                </p>
              </div>
            </label>
          )}
        />
      </div>

      {/* Impact Notice */}
      <div className="flex items-center gap-2 text-2xs text-success-text bg-success-soft p-2.5 rounded-lg border border-success-border">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          Directory records will be updated, deliverability reset to{" "}
          <strong>DELIVERABLE</strong>, and this alert resolved.
        </span>
      </div>

      <FormFooter className="-mx-5 -mb-5 px-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => guard(onCancel)}
          disabled={remediate.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={remediate.isPending}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Update & Remediate
        </Button>
      </FormFooter>
    </form>
  );
}
