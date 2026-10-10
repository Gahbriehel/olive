"use client";

import { useState, type JSX, type ReactNode } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter";
import { BaseButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { extractErrorMessage } from "@/utils/api-client";

export type ConfirmActionTone = "danger" | "default";

export interface ConfirmActionModalProps {
  close: () => void;
  fn: () => void | Promise<void>;
  display: boolean;
  actionName?: string;
  title?: string;
  /**
   * "danger" for irreversible/destructive actions (red styling + warning).
   * Defaults to "danger" only when actionName is "delete"; pass it explicitly
   * for anything else that destroys data (e.g. clearing scores).
   */
  tone?: ConfirmActionTone;
  /** Overrides the default supporting copy under the title. */
  description?: ReactNode;
  /** Overrides the confirm button label. */
  confirmLabel?: string;
  loading?: boolean;
  closeAfterAction?: boolean;
}

export function ConfirmActionModal({
  fn,
  actionName = "Delete",
  title,
  tone,
  description,
  confirmLabel,
  close,
  display,
  loading,
  closeAfterAction = true,
}: ConfirmActionModalProps): JSX.Element {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingState = loading ?? internalLoading;
  const isDestructive =
    (tone ??
      (actionName?.toLowerCase() === "delete" ? "danger" : "default")) ===
    "danger";

  const handleClose = () => {
    setError(null);
    close();
  };

  const handleAction = async () => {
    setError(null);
    try {
      setInternalLoading(true);
      await fn();
      if (closeAfterAction) {
        close();
      }
    } catch (err) {
      setError(
        extractErrorMessage(err, "Something went wrong. Please try again."),
      );
    } finally {
      setInternalLoading(false);
    }
  };

  const supportingCopy =
    description ??
    (isDestructive ? (
      <>
        This action is permanent and{" "}
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          cannot be undone
        </span>
        .
      </>
    ) : null);

  return (
    <Modal isOpen={display} onClose={handleClose} maxWidth="sm">
      <div className="flex flex-col items-center gap-4 p-2 text-center">
        {/* Icon */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            isDestructive
              ? "bg-rose-100 dark:bg-rose-950/50"
              : "bg-indigo-100 dark:bg-indigo-950/50"
          }`}
        >
          {isDestructive ? (
            <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
          ) : (
            <HelpCircle className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        {/* Text content */}
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {title ??
              `Are you sure you want to ${capitalizeFirstLetter(actionName)}?`}
          </h2>
          {supportingCopy && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {supportingCopy}
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <BaseButton
            text="Cancel"
            color="white"
            onClick={handleClose}
            disabled={isLoadingState}
          />
          <BaseButton
            text={
              confirmLabel ??
              (isDestructive
                ? capitalizeFirstLetter(actionName)
                : "Yes, proceed")
            }
            color={isDestructive ? "danger" : "primary"}
            onClick={handleAction}
            loading={isLoadingState}
          />
        </div>
      </div>
    </Modal>
  );
}
