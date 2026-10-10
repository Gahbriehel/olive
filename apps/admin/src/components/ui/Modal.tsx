"use client";

import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { clsx } from "clsx";
import {
  UnsavedChangesProvider,
  useCloseGuard,
} from "@/components/ui/UnsavedChanges";
import {
  OverlayBackdrop,
  OverlayFooter,
  OverlayHeader,
} from "@/components/ui/OverlayParts";

interface ModalProps {
  isOpen: boolean;
  /** Called on Escape, backdrop click and the close button. */
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  /** Rendered in the shared footer bar (buttons: secondary first, primary last). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWs = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/** Centred dialog for confirmations and short, focused tasks. */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  maxWidth = "md",
}) => {
  // Escape, backdrop and the close button ask before discarding a dirty form.
  const { requestClose, guardValue, discardDialog } = useCloseGuard(onClose);

  return (
    <Dialog open={isOpen} onClose={requestClose} className="relative z-50">
      <OverlayBackdrop />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={clsx(
            "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0",
            maxWs[maxWidth],
          )}
        >
          <UnsavedChangesProvider value={guardValue}>
            <OverlayHeader
              title={title}
              description={description}
              onClose={requestClose}
              className="p-5"
            />
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && (
              <OverlayFooter className="px-5 py-4">{footer}</OverlayFooter>
            )}
            {discardDialog}
          </UnsavedChangesProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
