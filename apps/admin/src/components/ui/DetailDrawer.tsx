"use client";

import { type JSX, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";

interface DetailDrawerProps {
  title: string;
  description?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  /**
   * The one action for this record (e.g. an Edit button), shown beside Close.
   * Everything else belongs in the table row menu or inside a tab.
   */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Standard view-only drawer (docs/architecture.md §6.2): a SidebarModal whose
 * footer is Close plus at most one action, text only, sharing the width
 * equally. Use it for every record detail view instead of building a footer.
 */
export function DetailDrawer({
  action,
  onClose,
  ...rest
}: DetailDrawerProps): JSX.Element {
  return (
    <SidebarModal
      {...rest}
      onClose={onClose}
      footerFill
      footerStart={
        <Button variant="outline" type="button" onClick={onClose}>
          Close
        </Button>
      }
      footer={action}
    />
  );
}
