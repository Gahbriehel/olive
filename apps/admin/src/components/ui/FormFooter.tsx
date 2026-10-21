import { type ReactNode } from "react";
import { cn } from "@/helpers/cn";

interface FormFooterProps {
  /** Cancel first, primary submit last. They share the width equally; text only, no icons. */
  children: ReactNode;
  /** Destructive action (e.g. DeleteButton), pinned to the far left at its natural width. */
  destructive?: ReactNode;
  className?: string;
}

/**
 * Action bar for forms rendered inside a SidebarModal or Modal body. It sticks
 * to the bottom of the scrolling body and bleeds to the panel edges, so it
 * looks like the overlay's own footer (docs/architecture.md §6.3). Same look
 * as the DetailDrawer footer: two buttons sharing the full width.
 */
export function FormFooter({
  children,
  destructive,
  className,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-6 -mb-4 mt-6 flex items-center gap-3 border-t border-border-subtle bg-surface px-6 py-4",
        className,
      )}
    >
      {destructive && <div className="shrink-0">{destructive}</div>}
      <div className="flex flex-1 items-center gap-3 *:flex-1">{children}</div>
    </div>
  );
}
