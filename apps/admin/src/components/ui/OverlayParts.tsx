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

interface ActionBarProps {
  /** Left slot: Close, Cancel, Clear all, or a destructive action. */
  start?: ReactNode;
  /** Right slot: secondary actions first, primary last. */
  children?: ReactNode;
  /** Stretch the start and end groups, and the buttons in them, to share the full width equally. */
  fill?: boolean;
  className?: string;
}

/**
 * The one layout for overlay actions, used by every footer (OverlayFooter and
 * FormFooter). `start` sits left, `children` sit right. When the row is too
 * narrow, each group wraps on its own and stays on its side, so a crowded
 * footer never leaves the primary action stranded on the left.
 */
export function ActionBar({
  start,
  children,
  fill,
  className,
}: ActionBarProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
    >
      {start && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            fill ? "flex-1 *:flex-1" : "mr-auto",
          )}
        >
          {start}
        </div>
      )}
      {children && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-end gap-2",
            fill ? "flex-1 *:flex-1" : "ml-auto",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Footer bar pinned to the bottom of an overlay (Modal and SidebarModal `footer` / `footerStart`). */
export function OverlayFooter({
  start,
  children,
  fill,
  className,
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border-subtle bg-subtle",
        className,
      )}
    >
      <ActionBar start={start} fill={fill}>
        {children}
      </ActionBar>
    </div>
  );
}
