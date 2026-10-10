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
    <Button variant="outline">
      <MoreHorizontal className="w-4 h-4" />
      {actionsLabel}
      <ChevronDown className="w-3.5 h-3.5 text-fg-subtle" />
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
