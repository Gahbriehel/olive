"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Cake, Send } from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IUpcomingBirthday } from "@/models/dashboard";
import { emailService } from "@/services/email.service";
import { customToast } from "@/helpers/customToast";
import dayjs from "dayjs";

interface BirthdayEmailFormValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface SendBirthdayEmailModalProps {
  birthday: IUpcomingBirthday | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendBirthdayEmailModal: React.FC<SendBirthdayEmailModalProps> = ({
  birthday,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BirthdayEmailFormValues>({
    defaultValues: {
      subject: "",
      heading: "",
      message: "",
      ctaLabel: "",
      ctaUrl: "",
    },
  });

  useEffect(() => {
    if (birthday && isOpen) {
      const firstName = birthday.firstName || "Member";
      reset({
        subject: `Happy Birthday, ${firstName}! 🎉`,
        heading: `Wishing You a Blessed Birthday!`,
        message: `<p>Dear beloved,</p><p>On behalf of our entire church community, we want to wish you a very happy and blessed birthday!</p><p>May this new year of your life be filled with abundant joy, peace, good health, and blessings in every endeavor.</p><p>Warmest regards,<br />Church Leadership</p>`,
        ctaLabel: "",
        ctaUrl: "",
      });
    }
  }, [birthday, isOpen, reset]);

  const onSubmit = async (formData: BirthdayEmailFormValues) => {
    if (!birthday) return;

    try {
      setIsSending(true);
      await emailService.sendSinglePersonEmail({
        personId: birthday.id,
        subject: formData.subject.trim(),
        heading: formData.heading.trim(),
        message: formData.message.trim(),
        ctaLabel: formData.ctaLabel?.trim()
          ? formData.ctaLabel.trim()
          : undefined,
        ctaUrl: formData.ctaUrl?.trim() ? formData.ctaUrl.trim() : undefined,
      });

      customToast.success(
        `Birthday greeting sent to ${birthday.firstName} ${birthday.lastName}!`,
      );
      onSuccess?.();
      onClose();
    } catch {
      // Handled by apiClient interceptor
    } finally {
      setIsSending(false);
    }
  };

  const targetDate = birthday?.nextBirthday || birthday?.dateOfBirth;
  const formattedDate = targetDate ? dayjs(targetDate).format("MMMM D") : "";

  return (
    <SidebarModal
      title="Send Birthday Greeting"
      display={isOpen}
      close={onClose}
    >
      {birthday && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-2"
        >
          {/* Recipient Details Pill */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-300 font-bold text-sm flex items-center justify-center shrink-0">
              <Cake className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {birthday.firstName} {birthday.lastName}
                </h4>
                <StatusBadge
                  status={birthday.membershipStatus || "MEMBER"}
                  size="sm"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {birthday.email || "No email on record"}
                {formattedDate && ` • Birthday: ${formattedDate}`}
              </p>
            </div>
          </div>

          {/* Message Subject */}
          <Controller
            name="subject"
            control={control}
            rules={{ required: "Subject is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Message Subject"
                placeholder="e.g. Happy Birthday! 🎉"
                error={errors.subject?.message}
                required
              />
            )}
          />

          {/* Email Heading */}
          <Controller
            name="heading"
            control={control}
            rules={{ required: "Email heading is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Heading"
                placeholder="e.g. Wishing You a Blessed Birthday!"
                error={errors.heading?.message}
                required
              />
            )}
          />

          {/* Message Body */}
          <Controller
            name="message"
            control={control}
            rules={{ required: "Message body is required" }}
            render={({ field }) => (
              <RichTextEditor
                {...field}
                label="Message Body"
                placeholder="Write your birthday greetings here..."
                error={errors.message?.message}
                required
              />
            )}
          />

          {/* Optional Call to Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <Controller
              name="ctaLabel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="CTA Button Label (Optional)"
                  placeholder="e.g. Visit Church Portal"
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
                  placeholder="https://..."
                  error={errors.ctaUrl?.message}
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row-reverse sm:border-t sm:border-slate-100 dark:sm:border-zinc-800">
            <Button
              type="submit"
              disabled={isSending || !birthday.email}
              isLoading={isSending}
              rightIcon={<Send className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Send Birthday Email
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isSending}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </SidebarModal>
  );
};
