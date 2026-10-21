"use client";

import { type JSX, type ReactNode } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  UnsavedChangesProvider,
  useCloseGuard,
} from "@/components/ui/UnsavedChanges";
import {
  OverlayBackdrop,
  OverlayFooter,
  OverlayHeader,
} from "@/components/ui/OverlayParts";

export interface Props {
  children: ReactNode;
  title: string;
  description?: ReactNode;
  /** Right side of the footer bar: secondary actions first, primary last. */
  footer?: ReactNode;
  /** Left side of the footer bar: Close, Cancel, Clear all or a destructive action. */
  footerStart?: ReactNode;
  /** Split the footer width equally between the start and end buttons. */
  footerFill?: boolean;
  isOpen: boolean;
  /** Called on Escape, backdrop click and the close button. */
  onClose: () => void;
}

/** Right-hand slide-over panel for create/edit forms and detail views. */
export const SidebarModal = ({
  title,
  description,
  footer,
  footerStart,
  footerFill,
  children,
  isOpen,
  onClose,
}: Props): JSX.Element => {
  // Escape, backdrop and the close button ask before discarding a dirty form.
  const { requestClose, guardValue, discardDialog } = useCloseGuard(onClose);

  return (
    <Dialog open={isOpen} onClose={requestClose} className="relative z-50">
      <OverlayBackdrop />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-border bg-surface shadow-2xl transition duration-300 ease-out data-closed:translate-x-full"
        >
          <UnsavedChangesProvider value={guardValue}>
            <OverlayHeader
              title={title}
              description={description}
              onClose={requestClose}
              className="px-6 pt-6 pb-4"
            />
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-6 py-4">
              {children}
            </div>
            {(footer || footerStart) && (
              <OverlayFooter
                className="px-6 py-4"
                start={footerStart}
                fill={footerFill}
              >
                {footer}
              </OverlayFooter>
            )}
            {discardDialog}
          </UnsavedChangesProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
