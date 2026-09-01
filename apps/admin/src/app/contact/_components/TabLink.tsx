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
}

export function TabLink({ value, href, children, icon }: TabLinkProps) {
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
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80",
      )}
    >
      <Link href={href}>
        {icon && (
          <span
            className={clsx(
              "w-4 h-4 flex items-center justify-center transition-colors",
              isActive ? "text-white" : "text-slate-400 dark:text-slate-500",
            )}
          >
            {icon}
          </span>
        )}
        {children}
      </Link>
    </Tabs.Trigger>
  );
}
