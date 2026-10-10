import { type ReactNode } from "react";
import { cn } from "@/helpers/cn";

interface FormFooterProps {
  /** Right-aligned actions: Cancel first, primary submit last. */
  children: ReactNode;
  /** Destructive action (e.g. DeleteButton), pinned to the far left. */
  destructive?: ReactNode;
  className?: string;
}

/**
 * Action bar for forms rendered inside a SidebarModal or Modal body. It sticks
 * to the bottom of the scrolling body and bleeds to the panel edges, so it
 * looks like the overlay's own footer (docs/architecture.md §6.3).
 */
export function FormFooter({
  children,
  destructive,
  className,
}: FormFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-6 -mb-4 mt-6 flex flex-col-reverse gap-3 border-t border-border-subtle bg-surface px-6 py-4 sm:flex-row sm:items-center",
        className,
      )}
    >
      {destructive && <div className="sm:mr-auto">{destructive}</div>}
      <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row sm:items-center">
        {children}
      </div>
    </div>
  );
}
