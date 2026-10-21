"use client";

import { type JSX, type ReactNode, useEffect, useRef, useState } from "react";

import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";

import { cn } from "@/helpers/cn";

interface InfoTipProps {
  /** Accessible name for the trigger, e.g. "About roles". */
  label: string;
  /** Optional bold heading inside the popover. */
  title?: ReactNode;
  /** Longer guidance, edge cases or an example. */
  children: ReactNode;
  className?: string;
}

/**
 * `ⓘ` button that opens a popover on click, tap or keyboard. Use it through a
 * field's `labelSuffix` for guidance too long for a `hint`. Not a hover-only
 * tooltip, so it works on touch and with a keyboard.
 */
export function InfoTip({
  label,
  title,
  children,
  className,
}: InfoTipProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Radix's own outside-press detection misses clicks inside a Headless UI
  // Dialog (the dialog swallows them), so close on any press outside both the
  // trigger and the popover, captured before anything can stop it.
  useEffect(() => {
    if (!open) return;
    const onPress = (e: Event): void => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPress, true);
    return () => document.removeEventListener("pointerdown", onPress, true);
  }, [open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          className={cn(
            "ml-1 inline-flex translate-y-[2px] cursor-pointer rounded-full text-fg-subtle transition-colors hover:text-fg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          sideOffset={6}
          align="start"
          collisionPadding={16}
          className="z-50 max-w-xs space-y-1 rounded-xl border border-border bg-surface p-3 text-xs font-normal text-fg-secondary shadow-xl focus:outline-none"
        >
          {title && <p className="font-semibold text-fg">{title}</p>}
          <div className="leading-relaxed">{children}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
