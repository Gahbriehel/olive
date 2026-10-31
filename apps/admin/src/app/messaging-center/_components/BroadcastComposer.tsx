"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Switch } from "@/components/FormElements/Switch";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { Button } from "@/components/ui/Button";
import { FormFooter } from "@/components/ui/FormFooter";
import { type ISelect } from "@/components/ui/Select";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import {
  EmailComposer,
  type EmailBaseValues,
} from "@/components/email/EmailComposer";
import { RecipientChips } from "@/components/email/RecipientChips";
import {
  emailContentFields,
  emailImageField,
  trimOrUndefined,
} from "@/components/email/emailFields";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { usePeopleSelectQuery } from "@/hooks/usePeopleSelect";
import { useSendBatchEmail } from "@/hooks/useEmail";
import { useIsUploadingFlyer } from "@/hooks/useUploads";
import { IPerson } from "@/models/person";
import { peopleService } from "@/services/people.service";
import { yup } from "@/models/validation";
import { type IBatchEmailPayload } from "@/services/email.service";

interface BroadcastFormValues extends EmailBaseValues {
  recipients: IPerson[];
  imageUrl?: string;
}

const broadcastSchema = yup.object({
  recipients: yup.array().of(yup.mixed<IPerson>().required()).required(),
  ...emailContentFields(),
  ...emailImageField(),
}) as yup.ObjectSchema<BroadcastFormValues>;

const ALL_PEOPLE_PAGE_SIZE = 100;

/** Every person ID, paged through the people list. */
async function fetchAllPersonIds(): Promise<string[]> {
  const ids: string[] = [];
  for (let page = 1; ; page++) {
    const res = await peopleService.getPeople({
      page,
      limit: ALL_PEOPLE_PAGE_SIZE,
    });
    res.people.forEach((p) => ids.push(p.id));
    const total = res.meta?.total ?? 0;
    if (res.people.length === 0 || ids.length >= total) return ids;
  }
}

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
  const isUploadingFlyer = useIsUploadingFlyer();
  const sendBatchEmail = useSendBatchEmail();
  const [pending, setPending] = useState<IBatchEmailPayload | null>(null);
  const [sendToAll, setSendToAll] = useState(false);
  const [resolvingAll, setResolvingAll] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
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
      imageUrl: "",
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
  const onSubmit = async (formData: BroadcastFormValues) => {
    let personIds: string[];
    if (sendToAll) {
      setResolvingAll(true);
      try {
        personIds = await fetchAllPersonIds();
      } catch {
        // The API client interceptor already toasted the error.
        return;
      } finally {
        setResolvingAll(false);
      }
      if (personIds.length === 0) return;
    } else {
      if (formData.recipients.length === 0) {
        setError("recipients", { message: "Select at least one recipient" });
        return;
      }
      personIds = formData.recipients.map((p) => p.id);
    }
    setPending({
      personIds,
      subject: formData.subject.trim(),
      heading: formData.heading.trim(),
      message: formData.message.trim(),
      ctaLabel: trimOrUndefined(formData.ctaLabel),
      ctaUrl: trimOrUndefined(formData.ctaUrl),
      imageUrl: trimOrUndefined(formData.imageUrl),
    });
  };

  const pendingCount = pending?.personIds.length ?? 0;

  return (
    <>
      <EmailComposer
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        image={{ label: "Announcement Flyer Image", upload: true }}
        recipients={
          <div className="flex flex-col gap-3">
            <p className="text-2xs text-fg-muted">
              People without an email address or who have unsubscribed will be
              skipped.
            </p>
            <Switch
              checked={sendToAll}
              onChange={setSendToAll}
              label="Send to everyone"
              description="Email every person in the directory instead of picking recipients"
              color="indigo"
            />
            {!sendToAll && (
              <>
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
                <RecipientChips
                  items={recipients.map((p) => ({
                    id: p.id,
                    name: p.name || `${p.firstName} ${p.lastName}`.trim(),
                    initials: (
                      p.firstName?.[0] ||
                      p.name?.[0] ||
                      "?"
                    ).toUpperCase(),
                  }))}
                  onRemove={(id) =>
                    setRecipients(recipients.filter((r) => r.id !== id))
                  }
                  onClear={() => setRecipients([])}
                />
              </>
            )}
          </div>
        }
        placeholders={{
          subject: "e.g. Weekly Fellowship & Community Announcement",
          heading: "e.g. Welcome to Sunday Service",
          message: "Write your broadcast message here...",
          imageUrl: "https://... or upload flyer image",
          ctaLabel: "e.g. Read More",
          ctaUrl: "https://example.org/news",
        }}
        footer={
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
              disabled={
                sendBatchEmail.isPending ||
                isUploadingFlyer ||
                resolvingAll ||
                (!sendToAll && selectedCount === 0)
              }
              loading={sendBatchEmail.isPending || resolvingAll}
            >
              {sendToAll
                ? "Send to everyone"
                : selectedCount > 0
                  ? `Send broadcast (${selectedCount})`
                  : "Send broadcast"}
            </Button>
          </FormFooter>
        }
      />

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
