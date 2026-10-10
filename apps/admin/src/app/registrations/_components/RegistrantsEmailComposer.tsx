"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Users, Send, X, Sparkles, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { type ISelect } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useRegistrationsSelectQuery } from "@/hooks/useRegistrationsSelect";
import { useSendRegistrantsEmail } from "@/hooks/useEmail";
import { optionalText, requiredText, url, yup } from "@/models/validation";
import { IRegistration } from "@/types/dashboard";
import { getInitials } from "@/utils/formatters";
import { useUploadFlyer } from "@/hooks/useUploads";
import { type ISendBatchRegistrantsEmailPayload } from "@/services/email.service";

interface EmailFormValues {
  sendToAll: boolean;
  recipients: IRegistration[];
  subject: string;
  heading: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  includeQrPass: boolean;
  imageUrl: string;
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
  subject: requiredText("Subject"),
  heading: optionalText(),
  message: requiredText("Message body"),
  ctaLabel: optionalText(),
  ctaUrl: url().default(""),
  includeQrPass: yup.boolean().required(),
  imageUrl: url().default(""),
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
  const sendEmail = useSendRegistrantsEmail();
  const [pending, setPending] =
    useState<ISendBatchRegistrantsEmailPayload | null>(null);
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
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
  const flyerImageUrl = watch("imageUrl");

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

  const { uploadFlyer } = useUploadFlyer();

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFlyer(true);
      const uploadedUrl = await uploadFlyer(file);
      setValue("imageUrl", uploadedUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Handled by toast interceptor
    } finally {
      setIsUploadingFlyer(false);
    }
  };

  const insertPlaceholder = (tag: string) => {
    const curSubject = getValues("subject") || "";
    setValue("subject", curSubject ? `${curSubject} ${tag}` : tag, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Validated values open the confirmation; the send happens on confirm.
  const onSubmit = (formData: EmailFormValues) => {
    const payload: ISendBatchRegistrantsEmailPayload = {
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      heading: formData.heading?.trim() || undefined,
      ctaLabel: formData.ctaLabel?.trim() || undefined,
      ctaUrl: formData.ctaUrl?.trim() || undefined,
      includeQrPass: formData.includeQrPass,
      imageUrl: formData.imageUrl?.trim() || undefined,
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* Recipient Scope Switch */}
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

        {/* All Registrants Notice */}
        {sendToAll ? (
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
        ) : (
          /* MultiSelect for Specific Registrants */
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

            {/* Selected Recipients Chips */}
            {recipients.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span>Selected ({recipients.length})</span>
                  <button
                    type="button"
                    onClick={() => setRecipients([])}
                    className="text-primary-text hover:underline text-2xs font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {recipients.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border-control text-fg shadow-xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                        {getInitials(r.name)}
                      </span>
                      <span className="max-w-[130px] truncate font-medium">
                        {r.name}
                      </span>
                      <span className="text-2xs text-fg-muted font-mono">
                        ({r.registrationNumber})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRecipients(recipients.filter((x) => x.id !== r.id))
                        }
                        className="text-fg-subtle hover:text-danger-text transition-colors ml-0.5"
                        title="Remove recipient"
                        aria-label={`Remove ${r.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subject Field & Placeholders */}
        <div className="flex flex-col gap-1.5">
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Subject"
                placeholder="e.g. Updates for {{eventTitle}}, {{firstName}}!"
                error={errors.subject?.message}
                required
              />
            )}
          />
          {/* Placeholder Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-2xs text-fg-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-text" />
              Placeholders:
            </span>
            {["{{firstName}}", "{{eventTitle}}", "{{registrationNumber}}"].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertPlaceholder(tag)}
                  className="text-2xs font-mono px-2 py-0.5 rounded-md bg-muted text-primary-text hover:bg-primary-soft transition-colors cursor-pointer"
                  title={`Click to append ${tag} to subject`}
                >
                  + {tag}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Heading */}
        <Controller
          name="heading"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email Banner Heading (Optional)"
              placeholder="e.g. Event Announcement"
              error={errors.heading?.message}
            />
          )}
        />

        {/* Message Body */}
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              {...field}
              label="Message Body"
              placeholder="Write your email announcement or reminder here..."
              error={errors.message?.message}
              required
            />
          )}
        />

        {/* Announcement Flyer Image */}
        <div className="space-y-2 pt-1 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-fg block">
              Announcement Flyer Image (Optional)
            </label>
            <span className="text-2xs text-fg-muted">
              Max 3MB (JPEG, PNG, WEBP)
            </span>
          </div>
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="https://... or upload flyer image"
                error={errors.imageUrl?.message}
              />
            )}
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted-strong cursor-pointer text-xs font-semibold text-fg-secondary transition-colors">
              {isUploadingFlyer ? (
                <Spinner size="sm" />
              ) : (
                <Upload className="w-4 h-4 text-primary-text" />
              )}
              <span>
                {isUploadingFlyer ? "Uploading..." : "Upload Image File"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFlyerUpload}
                disabled={isUploadingFlyer}
                className="hidden"
              />
            </label>
          </div>
          {flyerImageUrl && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-control bg-subtle mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flyerImageUrl}
                alt="Flyer Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setValue("imageUrl", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Include QR Pass Switch */}
        <Controller
          name="includeQrPass"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label="Include QR Check-In Pass"
              description="Attaches attendee's unique QR pass and event summary card in the email"
              color="indigo"
            />
          )}
        />

        {/* Optional Call to Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
          <Controller
            name="ctaLabel"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="CTA Button Label (Optional)"
                placeholder="e.g. View Venue Map"
                error={errors.ctaLabel?.message}
              />
            )}
          />
          <Controller
            name="ctaUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="CTA Button URL (Optional)"
                placeholder="https://example.org/map"
                error={errors.ctaUrl?.message}
              />
            )}
          />
        </div>

        {/* Form Action Buttons */}
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
              sendEmail.isPending || (!sendToAll && recipients.length === 0)
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
      </form>

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
