"use client";

import { type JSX, type ReactNode } from "react";

interface NotAvailableProps {
  children?: ReactNode;
}

export function NotAvailable({ children }: NotAvailableProps): JSX.Element {
  return (
    <span className="italic text-fg-subtle text-xs">
      {children ?? "Not available"}
    </span>
  );
}

export default NotAvailable;
