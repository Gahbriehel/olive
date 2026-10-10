"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { cn } from "@/helpers/cn";

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  /** Makes the tab a navigation link (route-based tabs) instead of a button. */
  href?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  /** Required for button tabs; ignored for link tabs. */
  onChange?: (tabId: string) => void;
  /** Accessible name for the tab list, e.g. "Event sections". */
  label?: string;
  className?: string;
}

/**
 * The one tab bar. Button tabs follow the ARIA tabs pattern (arrow keys,
 * Home/End, roving focus); tabs with `href` render as a nav of links with
 * aria-current, for route-based sections.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  label,
  className,
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const isNav = tabs.some((t) => t.href);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange?.(tabs[next].id);
  };

  const content = (tab: TabItem, isActive: boolean) => (
    <>
      {tab.icon && (
        <span className="flex h-4 w-4 items-center justify-center">
          {tab.icon}
        </span>
      )}
      <span>{tab.label}</span>
      {tab.count !== undefined && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 font-mono text-2xs",
            isActive
              ? "bg-primary-soft text-primary-text"
              : "bg-muted-strong text-fg-secondary",
          )}
        >
          {tab.count}
        </span>
      )}
    </>
  );

  const itemClass = (isActive: boolean) =>
    cn(
      "flex min-h-[38px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      isActive
        ? "bg-surface text-primary-text shadow-sm"
        : "text-fg-secondary hover:text-fg",
    );

  const listClass = cn(
    "no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted p-1",
    className,
  );

  if (isNav) {
    return (
      <nav aria-label={label} className={cn(listClass, "w-fit")}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href ?? "#"}
              aria-current={isActive ? "page" : undefined}
              className={itemClass(isActive)}
            >
              {content(tab, isActive)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div role="tablist" aria-label={label} className={listClass}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={itemClass(isActive)}
          >
            {content(tab, isActive)}
          </button>
        );
      })}
    </div>
  );
};
