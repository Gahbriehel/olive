"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Users, Send } from "lucide-react";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { type ISelect } from "@/components/ui/Select";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import {
  EmailComposer,
  type EmailContentValues,
} from "@/components/email/EmailComposer";
import { RecipientChips } from "@/components/email/RecipientChips";
import {
  emailContentFieldsOptionalHeading,
  emailImageField,
  emailQrPassField,
  trimOrUndefined,
} from "@/components/email/emailFields";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useRegistrationsSelectQuery } from "@/hooks/useRegistrationsSelect";
import { useSendRegistrantsEmail } from "@/hooks/useEmail";
import { useIsUploadingFlyer } from "@/hooks/useUploads";
import { yup } from "@/models/validation";
import { IRegistration } from "@/types/dashboard";
import { getInitials } from "@/utils/formatters";
import { type ISendBatchRegistrantsEmailPayload } from "@/services/email.service";

interface EmailFormValues extends EmailContentValues {
  sendToAll: boolean;
  recipients: IRegistration[];
}

const emailSchema = yup.object({
  sendToAll: yup.boolean().required(),
  recipients: yup
    .array()
    .of(yup.mixed<IRegistration>().required())
    .required()
    .when("sendToAll", {
      is: false,
      then: (schema) =>
        schema.min(
          1,
          "Select at least one recipient or enable 'Send to all registrants'",
        ),
    }),
  ...emailContentFieldsOptionalHeading(),
  ...emailImageField(),
  ...emailQrPassField(),
}) as yup.ObjectSchema<EmailFormValues>;

const transformRegistrationToSelect = (reg: IRegistration): ISelect => ({
  value: {
    _id: reg.id,
    registration: reg,
    email: reg.email,
    registrationNumber: reg.registrationNumber,
  },
  label: `${reg.name} (${reg.registrationNumber})`,
});

const PLACEHOLDER_TAGS = [
  "{{firstName}}",
  "{{eventTitle}}",
  "{{registrationNumber}}",
];

const plural = (n: number, word: string) =>
  `${n.toLocaleString()} ${n === 1 ? word : `${word}s`}`;

export interface RegistrantsEmailComposerProps {
  /** Opened from a registrant row: pre-selects them and turns off "send to all". */
  initialRecipient?: IRegistration | null;
  eventId?: string;
  eventName?: string;
  /** Registrations list filters; "send to all" targets everyone matching them. */
  filters: { status?: string; teamId?: string; search?: string };
  /** Registrants matching the current filters (shown in the notice). */
  matchingCount: number;
  /** Same count, only when the server reported it (used in the confirmation). */
  reliableMatchingCount?: number;
  /** Registrations already loaded on the page, to fill in selected options. */
  loadedRegistrations: IRegistration[];
  onCancel: () => void;
  /** Called after a successful send; the parent closes the panel. */
  onSent: () => void;
}

/** "Send Email to Registrants" form; rendered inside the SidebarModal. */
export function RegistrantsEmailComposer({
  initialRecipient,
  eventId,
  eventName,
  filters,
  matchingCount,
  reliableMatchingCount,
  loadedRegistrations,
  onCancel,
  onSent,
}: RegistrantsEmailComposerProps) {
  const isUploadingFlyer = useIsUploadingFlyer();
  const sendEmail = useSendRegistrantsEmail();
  const [pending, setPending] =
    useState<ISendBatchRegistrantsEmailPayload | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EmailFormValues>({
    resolver: yupResolver(emailSchema),
    mode: "onTouched",
    defaultValues: {
      sendToAll: !initialRecipient,
      recipients: initialRecipient ? [initialRecipient] : [],
      subject: "",
      heading: "",
      message: "",
      ctaLabel: "",
      ctaUrl: "",
      includeQrPass: false,
      imageUrl: "",
    },
  });

  const { guard } = useUnsavedChangesGuard(isDirty);

  // eslint-disable-next-line react-hooks/incompatible-library
  const sendToAll = watch("sendToAll");
  const recipients = watch("recipients");

  const setRecipients = (next: IRegistration[]) =>
    setValue("recipients", next, { shouldDirty: true, shouldValidate: true });

  const handleMultiSelectChange = (newValues: ISelect[]) => {
    const next: IRegistration[] = [];
    newValues.forEach((item) => {
      const regId = item.value._id;
      if (!regId) return;
      next.push(
        item.value.registration ||
          recipients.find((r) => r.id === regId) ||
          loadedRegistrations.find((r) => r.id === regId) ||
          ({
            id: regId,
            registrationNumber: item.value.registrationNumber || "",
            name: item.label.split(" (")[0] || item.label,
            email: item.value.email || "",
          } as unknown as IRegistration),
      );
    });
    setRecipients(next);
  };

  // Validated values open the confirmation; the send happens on confirm.
  const onSubmit = (formData: EmailFormValues) => {
    const payload: ISendBatchRegistrantsEmailPayload = {
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      heading: trimOrUndefined(formData.heading),
      ctaLabel: trimOrUndefined(formData.ctaLabel),
      ctaUrl: trimOrUndefined(formData.ctaUrl),
      includeQrPass: formData.includeQrPass,
      imageUrl: trimOrUndefined(formData.imageUrl),
    };

    if (formData.sendToAll) {
      if (eventId) {
        payload.eventId = eventId;
      }
      payload.status = filters.status as
        ISendBatchRegistrantsEmailPayload["status"] | undefined;
      payload.teamId = filters.teamId;
      payload.search = filters.search?.trim() || undefined;
    } else {
      payload.registrationIds = formData.recipients.map((r) => r.id);
      if (eventId) {
        payload.eventId = eventId;
      }
    }

    setPending(payload);
  };

  const isFiltered = Boolean(
    filters.status || filters.teamId || filters.search?.trim(),
  );
  const eventLabel = eventName || "this event";
  const confirmTitle = pending?.registrationIds
    ? `Send this email to ${plural(pending.registrationIds.length, "recipient")}?`
    : reliableMatchingCount !== undefined
      ? `Send this email to ${plural(reliableMatchingCount, "recipient")}?`
      : `Send this email to all registrants of ${eventLabel}?`;
  const confirmDescription = pending?.registrationIds
    ? "Each selected registrant will receive this email. Sent emails can't be recalled."
    : `Every registrant of ${eventLabel}${
        isFiltered ? " matching the current filters" : ""
      } will receive this email. Sent emails can't be recalled.`;

  return (
    <>
      <EmailComposer
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        recipients={
          <>
            <Controller
              name="sendToAll"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Send to all registrants for this event"
                  description={
                    field.value
                      ? "Broadcasting to all registered attendees for this event"
                      : "Select specific attendees using the MultiSelect below"
                  }
                  color="indigo"
                />
              )}
            />
            {!sendToAll && (
              <div className="flex flex-col gap-2">
                <MultiSelect
                  label="Recipients"
                  placeholder="Search & select attendees by name or reg #..."
                  value={recipients.map(transformRegistrationToSelect)}
                  onChange={handleMultiSelectChange}
                  queryHook={useRegistrationsSelectQuery}
                  dataKey="items"
                  transformData={transformRegistrationToSelect}
                  validationError={errors.recipients?.message}
                />
                <RecipientChips
                  items={recipients.map((r) => ({
                    id: r.id,
                    name: r.name,
                    initials: getInitials(r.name),
                    meta: r.registrationNumber,
                  }))}
                  onRemove={(id) =>
                    setRecipients(recipients.filter((x) => x.id !== id))
                  }
                  onClear={() => setRecipients([])}
                />
              </div>
            )}
          </>
        }
        notice={
          sendToAll && (
            <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary-border text-xs text-fg flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Users className="w-4 h-4 text-primary-text shrink-0" />
                <span>Target: All Event Registrants</span>
              </div>
              <p className="text-2xs text-fg-secondary">
                Email will be sent to all matching registrants (
                {matchingCount.toLocaleString()} attendees)
                {filters.status && ` with status: ${filters.status}`}
                {filters.teamId && " for selected team"}.
              </p>
            </div>
          )
        }
        headingRequired={false}
        placeholderTags={PLACEHOLDER_TAGS}
        image={{ label: "Announcement Flyer Image", upload: true }}
        qrPass
        placeholders={{
          subject: "e.g. Updates for {{eventTitle}}, {{firstName}}!",
          heading: "e.g. Event Announcement",
          message: "Write your email announcement or reminder here...",
          imageUrl: "https://... or upload flyer image",
          ctaLabel: "e.g. View Venue Map",
          ctaUrl: "https://example.org/map",
        }}
        footer={
          <FormFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => guard(onCancel)}
              disabled={sendEmail.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                sendEmail.isPending ||
                isUploadingFlyer ||
                (!sendToAll && recipients.length === 0)
              }
              loading={sendEmail.isPending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {sendEmail.isPending
                ? "Sending..."
                : sendToAll
                  ? "Send to all registrants"
                  : recipients.length > 0
                    ? `Send email (${recipients.length})`
                    : "Send email"}
            </Button>
          </FormFooter>
        }
      />

      <ConfirmActionModal
        display={pending !== null}
        close={() => setPending(null)}
        fn={async () => {
          if (!pending) return;
          await sendEmail.mutateAsync(pending);
          onSent();
        }}
        actionName="Send"
        tone="default"
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Send"
        loading={sendEmail.isPending}
      />
    </>
  );
}
