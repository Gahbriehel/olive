"use client";

import { type ReactNode } from "react";
import { MoreHorizontal, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/helpers/cn";
import { Button } from "@/components/ui/Button";
import { ActionsList } from "@/components/ui/ActionsList";

export interface ListToolbarAction {
  title: string;
  fn?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  confirmDelete?: boolean;
}

export interface ListToolbarProps {
  create?: {
    label: string;
    onClick: () => void;
    show?: boolean;
    icon?: ReactNode;
  };
  actions?: ListToolbarAction[];
  actionsTrigger?: ReactNode;
  actionsLabel?: string;
  trailing?: ReactNode;
  className?: string;
}

// Shared with FiltersButton so the two secondary toolbar buttons read the
// same in dark mode as the zinc-toned surfaces they sit next to (Table,
// SidebarModal, ActionsList popover) rather than Button's default slate tone.
export const secondaryToolbarButtonClass =
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600";

export function ListToolbar({
  create,
  actions,
  actionsTrigger,
  actionsLabel = "Actions",
  trailing,
  className,
}: ListToolbarProps) {
  const showCreate = Boolean(create) && create?.show !== false;
  const showActions = Boolean(actions && actions.length > 0);

  if (!showCreate && !showActions && !trailing) return null;

  // Radix's `Popover.Trigger asChild` clones its immediate child and injects
  // onClick/aria-*/data-state props onto it, so that child must forward refs
  // and spread props through to a real DOM node. Button does this itself
  // (it's forwardRef), so it must be the direct child here — never wrapped
  // in another function component, which would silently swallow those props.
  const defaultTrigger = (
    <Button
      variant="outline"
      position="icon-last"
      className={secondaryToolbarButtonClass}
    >
      <MoreHorizontal className="w-4 h-4" />
      {actionsLabel}
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
    </Button>
  );

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {showCreate && create && (
        <Button
          variant="primary"
          onClick={create.onClick}
          leftIcon={create.icon ?? <Plus className="w-4 h-4" />}
        >
          {create.label}
        </Button>
      )}
      {showActions && (
        <ActionsList
          actions={actions ?? []}
          trigger={actionsTrigger ?? defaultTrigger}
        />
      )}
      {trailing}
    </div>
  );
}
