"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { BaseButton } from "@/components/ui/Button";

export interface ConfirmActionModalProps {
  actionName?: string;
  title?: string;
  fn: () => void;
  loading?: boolean;
  close: () => void;
  display: boolean;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  actionName = "Delete",
  title = "Are you sure?",
  fn,
  loading = false,
  close,
  display,
}) => {
  return (
    <Modal isOpen={display} onClose={close} title={title}>
      <div className="space-y-4 pt-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This action cannot be undone. Are you sure you want to proceed with{" "}
          <span className="font-semibold text-rose-600">{actionName}</span>?
        </p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <BaseButton
            type="button"
            color="outline"
            text="Cancel"
            onClick={close}
            disabled={loading}
          />
          <BaseButton
            type="button"
            color="danger"
            text={actionName}
            loading={loading}
            onClick={() => {
              fn();
              close();
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
