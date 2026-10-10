"use client";

import React, { useState, useId } from "react";
import { Send, AlertCircle, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { EmailBounce } from "@/models/emailBounce";
import { emailBounceService } from "@/services/emailBounce.service";
import { customToast } from "@/helpers/customToast";

interface RemediateBounceModalProps {
  bounce: EmailBounce | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RemediateBounceModal: React.FC<RemediateBounceModalProps> = ({
  bounce,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const formId = useId();
  const [newEmail, setNewEmail] = useState("");
  const [resendOriginal, setResendOriginal] = useState(true);
  const [customSubject, setCustomSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bounce) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter a valid corrected email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email format (e.g. name@domain.com).");
      return;
    }

    if (cleanEmail === bounce.email.toLowerCase()) {
      setError("The new email must be different from the failing address.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await emailBounceService.remediateBounce(bounce.id, {
        newEmail: cleanEmail,
        resendOriginal,
        subject: customSubject.trim() || undefined,
      });

      customToast.success(
        res?.message || `Successfully corrected email to ${cleanEmail}`,
      );
      setNewEmail("");
      setCustomSubject("");
      onSuccess?.();
      onClose();
    } catch {
      // Error toast already triggered by apiClient interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Update & Remediate
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Remediate & Fix Bounced Email"
      maxWidth="md"
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Info Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              Current Failing Address:
            </span>
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
              {bounce.email}
            </span>
          </div>
          {bounce.reason && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Failure Diagnostic
              </span>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                {bounce.reason}
              </p>
            </div>
          )}
        </div>

        {/* New Email Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Corrected Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="e.g. correct.email@example.com"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              if (error) setError(null);
            }}
            required
            autoFocus
          />
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Optional Custom Subject */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Custom Subject Line (Optional)
          </label>
          <Input
            type="text"
            placeholder="Leave blank to use original email subject"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={resendOriginal}
              onChange={(e) => setResendOriginal(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
            />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Resend original email to corrected address
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Automatically delivers the pending message (e.g., ticket QR code
                or confirmation) to the new email.
              </p>
            </div>
          </label>
        </div>

        {/* Impact Notice */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            Directory records will be updated, deliverability reset to{" "}
            <strong>DELIVERABLE</strong>, and this alert resolved.
          </span>
        </div>
      </form>
    </Modal>
  );
};
