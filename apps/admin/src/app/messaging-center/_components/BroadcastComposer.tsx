"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send, X } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { type ISelect } from "@/components/ui/Select";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { usePeopleSelectQuery } from "@/hooks/usePeopleSelect";
import { useSendBatchEmail } from "@/hooks/useEmail";
import { IPerson } from "@/models/person";
import { optionalText, requiredText, url, yup } from "@/models/validation";
import { type IBatchEmailPayload } from "@/services/email.service";

interface BroadcastFormValues {
  recipients: IPerson[];
  subject: string;
  heading: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
}

const broadcastSchema = yup.object({
  recipients: yup
    .array()
    .of(yup.mixed<IPerson>().required())
    .min(1, "Select at least one recipient")
    .required(),
  subject: requiredText("Message subject"),
  heading: requiredText("Heading"),
  message: requiredText("Message body"),
  ctaLabel: optionalText(),
  ctaUrl: url().default(""),
}) as yup.ObjectSchema<BroadcastFormValues>;

const transformPersonToSelect = (person: IPerson): ISelect => ({
  value: {
    _id: person.id,
    person,
    email: person.email,
    phone: person.phone,
  },
  label:
    `${person.firstName} ${person.lastName}`.trim() ||
    person.name ||
    person.email ||
    "Unknown",
});

/** Minimal person for an option that arrived without its full record. */
const personFromOption = (item: ISelect, personId: string): IPerson =>
  ({
    id: personId,
    name: item.label,
    firstName: item.label.split(" ")[0] || item.label,
    lastName: item.label.split(" ").slice(1).join(" ") || "",
    email: item.value.email || "",
    phone: item.value.phone || "",
    gender: "Male",
    dob: "",
    membershipStatus: "Member",
    registrationHistoryCount: 0,
    eventsAttendedCount: 0,
    registrations: [],
    attendanceHistory: [],
  }) as IPerson;

interface BroadcastComposerProps {
  onCancel: () => void;
  /** Called after a successful send; the parent closes the panel. */
  onSent: () => void;
}

/** Compose Broadcast form; rendered inside the SidebarModal. */
export function BroadcastComposer({
  onCancel,
  onSent,
}: BroadcastComposerProps) {
  const sendBatchEmail = useSendBatchEmail();
  const [pending, setPending] = useState<IBatchEmailPayload | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BroadcastFormValues>({
    resolver: yupResolver(broadcastSchema),
    mode: "onTouched",
    defaultValues: {
      recipients: [],
      subject: "",
      heading: "",
      message: "",
      ctaLabel: "",
      ctaUrl: "",
    },
  });

  const { guard } = useUnsavedChangesGuard(isDirty);

  // eslint-disable-next-line react-hooks/incompatible-library
  const recipients = watch("recipients");
  const selectedCount = recipients.length;

  const setRecipients = (next: IPerson[]) =>
    setValue("recipients", next, { shouldDirty: true, shouldValidate: true });

  const handleMultiSelectChange = (newValues: ISelect[]) => {
    const next: IPerson[] = [];
    newValues.forEach((item) => {
      const personId = item.value._id;
      if (!personId) return;
      next.push(
        item.value.person ||
          recipients.find((p) => p.id === personId) ||
          personFromOption(item, personId),
      );
    });
    setRecipients(next);
  };

  // Validated values open the confirmation; the send happens on confirm.
  const onSubmit = (formData: BroadcastFormValues) =>
    setPending({
      personIds: formData.recipients.map((p) => p.id),
      subject: formData.subject.trim(),
      heading: formData.heading.trim(),
      message: formData.message.trim(),
      ctaLabel: formData.ctaLabel?.trim()
        ? formData.ctaLabel.trim()
        : undefined,
      ctaUrl: formData.ctaUrl?.trim() ? formData.ctaUrl.trim() : undefined,
    });

  const pendingCount = pending?.personIds.length ?? 0;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* MultiSelect Element for Recipients */}
        <div className="flex flex-col gap-1.5">
          <MultiSelect
            label="Recipients"
            placeholder="Search & select recipients..."
            value={recipients.map(transformPersonToSelect)}
            onChange={handleMultiSelectChange}
            queryHook={usePeopleSelectQuery}
            dataKey="items"
            transformData={transformPersonToSelect}
            closeIconFn={() => setRecipients([])}
            validationError={errors.recipients?.message}
            required
          />
        </div>

        {selectedCount > 0 && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-subtle border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fg-secondary">
                Selected Recipients ({selectedCount})
              </span>
              <button
                type="button"
                onClick={() => setRecipients([])}
                className="text-2xs font-medium text-fg-muted hover:text-danger-text transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {recipients.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border-control text-fg shadow-xs"
                >
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                    {(p.firstName?.[0] || p.name?.[0] || "?").toUpperCase()}
                  </span>
                  <span className="max-w-[130px] truncate">
                    {p.name || `${p.firstName} ${p.lastName}`.trim()}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipients(recipients.filter((r) => r.id !== p.id))
                    }
                    className="text-fg-subtle hover:text-danger-text transition-colors ml-0.5 cursor-pointer"
                    title="Remove recipient"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Message Subject"
              placeholder="e.g. Weekly Fellowship & Community Announcement"
              error={errors.subject?.message}
              required
            />
          )}
        />

        <Controller
          name="heading"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email Heading"
              placeholder="e.g. Welcome to Sunday Service"
              error={errors.heading?.message}
              required
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              {...field}
              label="Message Body"
              placeholder="Write your broadcast message here..."
              error={errors.message?.message}
              required
            />
          )}
        />

        {/* Call to Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
          <Controller
            name="ctaLabel"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="CTA Button Label (Optional)"
                placeholder="e.g. Read More"
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
                placeholder="https://example.org/news"
                error={errors.ctaUrl?.message}
              />
            )}
          />
        </div>

        <FormFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => guard(onCancel)}
            disabled={sendBatchEmail.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={sendBatchEmail.isPending || selectedCount === 0}
            loading={sendBatchEmail.isPending}
            rightIcon={<Send className="w-4 h-4" />}
          >
            {selectedCount > 0
              ? `Send broadcast (${selectedCount})`
              : "Send broadcast"}
          </Button>
        </FormFooter>
      </form>

      <ConfirmActionModal
        display={pending !== null}
        close={() => setPending(null)}
        fn={async () => {
          if (!pending) return;
          await sendBatchEmail.mutateAsync(pending);
          onSent();
        }}
        actionName="Send"
        tone="default"
        title={`Send this broadcast to ${pendingCount.toLocaleString()} ${
          pendingCount === 1 ? "recipient" : "recipients"
        }?`}
        description="Each selected person will receive this email. Sent emails can't be recalled."
        confirmLabel="Send"
        loading={sendBatchEmail.isPending}
      />
    </>
  );
}
