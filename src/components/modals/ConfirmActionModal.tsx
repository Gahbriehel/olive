"use client";

import type { JSX } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

import { capitalizeFirstLetter } from "@/helpers/capitalizeFirstLetter";
import { BaseButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export interface ConfirmActionModalProps {
  close: () => void;
  fn: () => void;
  display: boolean;
  actionName?: string;
  title?: string;
  loading?: boolean;
  closeAfterAction?: boolean;
}

export function ConfirmActionModal({
  fn,
  actionName = "Delete",
  title,
  close,
  display,
  loading,
  closeAfterAction = true,
}: ConfirmActionModalProps): JSX.Element {
  const isDestructive = ["delete", "logout"].includes(
    actionName?.toLowerCase(),
  );

  return (
    <Modal isOpen={display} onClose={close}>
      <div className="flex flex-col items-center gap-5 p-6 pb-2 text-center">
        {/* Icon */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
            isDestructive
              ? "bg-rose-100 dark:bg-rose-950/50"
              : "bg-indigo-100 dark:bg-indigo-950/50"
          }`}
        >
          {isDestructive ? (
            <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          ) : (
            <HelpCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        {/* Text content */}
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title ??
              `Are you sure you want to ${capitalizeFirstLetter(actionName)}?`}
          </h2>
          {isDestructive && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This action is permanent and{" "}
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                cannot be undone
              </span>
              .
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-2 grid w-full grid-cols-2 gap-3">
          <BaseButton
            text={isDestructive ? "Cancel" : "No"}
            color="white"
            onClick={close}
          />
          <BaseButton
            text={
              isDestructive ? capitalizeFirstLetter(actionName) : "Yes, proceed"
            }
            color={isDestructive ? "danger" : "primary"}
            onClick={() => {
              fn();
              if (closeAfterAction) {
                close();
              }
            }}
            loading={loading}
          />
        </div>
      </div>
    </Modal>
  );
}
