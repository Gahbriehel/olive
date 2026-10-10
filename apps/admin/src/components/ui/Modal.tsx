"use client";

import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { clsx } from "clsx";
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
}) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-50">
    <OverlayBackdrop />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        transition
        className={clsx(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:border-zinc-800 dark:bg-zinc-900",
          maxWs[maxWidth],
        )}
      >
        <OverlayHeader
          title={title}
          description={description}
          onClose={onClose}
          className="p-5"
        />
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <OverlayFooter className="px-5 py-4">{footer}</OverlayFooter>
        )}
      </DialogPanel>
    </div>
  </Dialog>
);
