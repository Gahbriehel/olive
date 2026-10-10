"use client";

import { type ReactNode } from "react";
import { Description, DialogBackdrop, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/helpers/cn";

/** Shared building blocks for Modal and SidebarModal so both overlays look and behave alike. */

export function OverlayBackdrop() {
  return (
    <DialogBackdrop
      transition
      className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-200 ease-out data-closed:opacity-0"
    />
  );
}

interface OverlayHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  className?: string;
}

export function OverlayHeader({
  title,
  description,
  onClose,
  className,
}: OverlayHeaderProps) {
  if (!title) return null;
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <DialogTitle className="truncate text-lg font-semibold text-fg">
          {title}
        </DialogTitle>
        {description && (
          <Description as="div" className="mt-0.5 text-xs text-fg-muted">
            {description}
          </Description>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-muted hover:text-fg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Action bar pinned to the bottom of an overlay: secondary actions left, primary right. */
export function OverlayFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col-reverse gap-3 border-t border-border-subtle bg-subtle sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
