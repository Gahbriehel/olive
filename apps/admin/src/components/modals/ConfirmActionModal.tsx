"use client";

import { useState, type JSX, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { AlertTriangle, HelpCircle } from "lucide-react";

import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter";
import { Button } from "@/components/ui/Button";
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
      // The dialog stays open either way. API failures are already toasted by
      // the API client interceptor, so only other errors are shown inline.
      if (!isAxiosError(err)) {
        setError(
          extractErrorMessage(err, "Something went wrong. Please try again."),
        );
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const supportingCopy =
    description ??
    (isDestructive ? (
      <>
        This action is permanent and{" "}
        <span className="font-semibold text-danger-text">cannot be undone</span>
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
            <AlertTriangle className="h-7 w-7 text-danger-text" />
          ) : (
            <HelpCircle className="h-7 w-7 text-primary-text" />
          )}
        </div>

        {/* Text content */}
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-fg leading-snug">
            {title ??
              `Are you sure you want to ${capitalizeFirstLetter(actionName)}?`}
          </h2>
          {supportingCopy && (
            <p className="text-xs text-fg-muted">{supportingCopy}</p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="w-full rounded-xl border border-danger-border bg-danger-soft px-3 py-2 text-xs font-medium text-danger-text"
          >
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoadingState}
          >
            Cancel
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={handleAction}
            loading={isLoadingState}
          >
            {confirmLabel ??
              (isDestructive
                ? capitalizeFirstLetter(actionName)
                : "Yes, proceed")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
