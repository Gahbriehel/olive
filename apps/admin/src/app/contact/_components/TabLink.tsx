"use client";

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { clsx } from "clsx";

interface TabLinkProps {
  value: string;
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  count?: number | string;
}

export function TabLink({ value, href, children, icon, count }: TabLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Tabs.Trigger
      value={value}
      asChild
      className={clsx(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        isActive
          ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
          : "text-fg-secondary hover:text-fg hover:bg-muted",
      )}
    >
      <Link href={href} className="flex items-center gap-2">
        {icon && (
          <span
            className={clsx(
              "w-4 h-4 flex items-center justify-center transition-colors",
              isActive ? "text-white" : "text-fg-subtle",
            )}
          >
            {icon}
          </span>
        )}
        <span>{children}</span>
        {count !== undefined && (
          <span
            className={clsx(
              "px-1.5 py-0.5 text-2xs rounded-md font-mono font-semibold",
              isActive ? "bg-white/20 text-white" : "bg-muted text-fg-muted",
            )}
          >
            {count}
          </span>
        )}
      </Link>
    </Tabs.Trigger>
  );
}
