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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ease-out data-closed:opacity-0 dark:bg-black/70"
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
        "flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <DialogTitle className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </DialogTitle>
        {description && (
          <Description
            as="div"
            className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
          >
            {description}
          </Description>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:hover:bg-zinc-800 dark:hover:text-slate-200"
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
        "flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 sm:flex-row sm:items-center sm:justify-end dark:border-zinc-800 dark:bg-zinc-900/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
