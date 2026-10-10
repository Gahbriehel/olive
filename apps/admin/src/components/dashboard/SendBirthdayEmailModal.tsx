"use client";

import React, { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Cake, Send } from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { Button } from "@/components/ui/Button";
import { useUnsavedChangesGuard } from "@/components/ui/UnsavedChanges";
import { EmailComposer } from "@/components/email/EmailComposer";
import { trimOrUndefined } from "@/components/email/emailFields";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IUpcomingBirthday } from "@/models/dashboard";
import { BirthdayPersonItem } from "@/models/birthday";
import { useSendBirthdayGreeting } from "@/hooks/useBirthdays";
import {
  birthdayGreetingSchema,
  type BirthdayGreetingFormValues,
} from "@/components/Forms/schemas/birthdayGreetingSchema";
import dayjs from "dayjs";

interface SendBirthdayEmailModalProps {
  birthday: IUpcomingBirthday | BirthdayPersonItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Cancel button rendered inside the SidebarModal (where the unsaved-changes
 * context lives); reports the form's dirty state and guards Cancel.
 */
const GuardedCancel: React.FC<{
  isDirty: boolean;
  disabled: boolean;
  onCancel: () => void;
}> = ({ isDirty, disabled, onCancel }) => {
  const { guard } = useUnsavedChangesGuard(isDirty);
  return (
    <Button
      variant="outline"
      type="button"
      disabled={disabled}
      onClick={() => guard(onCancel)}
      className="w-full sm:w-auto"
    >
      Cancel
    </Button>
  );
};

export const SendBirthdayEmailModal: React.FC<SendBirthdayEmailModalProps> = ({
  birthday,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const formId = useId();
  const { mutateAsync: sendGreeting } = useSendBirthdayGreeting();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(birthdayGreetingSchema),
    mode: "onTouched",
    defaultValues: {
      subject: "",
      heading: "",
      message: "",
      imageUrl: "",
      ctaLabel: "",
      ctaUrl: "",
    },
  });

  useEffect(() => {
    if (birthday && isOpen) {
      const firstName = birthday.firstName || "Member";
      reset({
        subject: `Happy Birthday, ${firstName}! 🎂 Celebrating You Today!`,
        heading: `Happy Birthday, ${firstName}!`,
        message: `<p>Dear ${firstName},</p><p>On behalf of our entire church family, we want to wish you a very happy and blessed birthday!</p><p>May this new year of your life be filled with God's abundant grace, peace, good health, and fruitfulness in all you do.</p><p>Warmest blessings,<br />Church Leadership</p>`,
        imageUrl: "",
        ctaLabel: "",
        ctaUrl: "",
      });
    }
  }, [birthday, isOpen, reset]);

  const onSubmit = async (formData: BirthdayGreetingFormValues) => {
    if (!birthday) return;

    try {
      await sendGreeting({
        personId: birthday.id,
        subject: formData.subject.trim(),
        heading: formData.heading.trim(),
        message: formData.message.trim(),
        imageUrl: trimOrUndefined(formData.imageUrl),
        ctaLabel: trimOrUndefined(formData.ctaLabel),
        ctaUrl: trimOrUndefined(formData.ctaUrl),
      });
    } catch {
      // The API client interceptor already toasted the error.
      return;
    }
    onSuccess?.();
    onClose();
  };

  const targetDate =
    ("nextBirthday" in (birthday || {})
      ? (birthday as IUpcomingBirthday).nextBirthday
      : null) ||
    ("birthdayDate" in (birthday || {})
      ? (birthday as BirthdayPersonItem).birthdayDate
      : null) ||
    birthday?.dateOfBirth;
  const formattedDate = targetDate ? dayjs(targetDate).format("MMMM D") : "";

  return (
    <SidebarModal
      footer={
        birthday && (
          <>
            <GuardedCancel
              isDirty={isDirty && !isSubmitSuccessful}
              disabled={isSubmitting}
              onCancel={onClose}
            />
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting || !birthday.email || birthday.isGreeted}
              loading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Send Birthday Greeting
            </Button>
          </>
        )
      }
      title="Send Birthday Greeting"
      isOpen={isOpen}
      onClose={onClose}
    >
      {birthday && (
        <EmailComposer
          control={control}
          formId={formId}
          onSubmit={handleSubmit(onSubmit)}
          recipients={
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-subtle border border-border-control">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-text font-bold text-sm flex items-center justify-center shrink-0 border border-primary-border">
                <Cake className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-fg truncate">
                    {birthday.firstName} {birthday.lastName}
                  </h4>
                  <StatusBadge
                    status={birthday.membershipStatus || "MEMBER"}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-fg-muted truncate">
                  {birthday.email || "No email on record"}
                  {formattedDate && ` • Birthday: ${formattedDate}`}
                </p>
              </div>
            </div>
          }
          image={{ label: "Birthday Card Image" }}
          placeholders={{
            subject: "e.g. Happy Birthday! 🎂",
            heading: "e.g. Wishing You a Blessed Birthday!",
            message: "Write your birthday greetings here...",
            imageUrl: "e.g. /public/uploads/birthday-card.png or https://...",
            ctaLabel: "e.g. Visit Church Portal",
          }}
        />
      )}
    </SidebarModal>
  );
};
