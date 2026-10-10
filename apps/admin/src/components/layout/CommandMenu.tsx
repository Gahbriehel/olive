"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import {
  ArrowRight,
  Moon,
  Plus,
  QrCode,
  Search,
  Settings,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { filterNavItems, mainNavItems, type NavItem } from "@/helpers/navlinks";
import {
  getUserRoles,
  hasAuthority,
  ROLES,
  ROUTE_PERMISSIONS,
} from "@/utils/rbac";

interface Command {
  id: string;
  label: string;
  group: "Pages" | "Actions";
  icon: LucideIcon;
  /** Shown after the label, e.g. the parent section. */
  hint?: string;
  run: () => void;
}

interface NavEntry {
  label: string;
  icon: LucideIcon;
  hint?: string;
  href: string;
}

/** Flattens the role-filtered sidebar tree; children carry their section as a hint. */
function flattenNav(items: NavItem[], parent?: string): NavEntry[] {
  return items.flatMap((item) => [
    ...(item.href
      ? [{ label: item.label, icon: item.icon, hint: parent, href: item.href }]
      : []),
    ...(item.subs ? flattenNav(item.subs, item.label) : []),
  ]);
}

/**
 * ⌘K command palette: jump to any page the user can access, or run a
 * shell action. Built on Headless UI Dialog + Combobox (focus trap, Escape,
 * arrow-key navigation).
 */
export const CommandMenu: React.FC = () => {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    setIsCreateEventOpen,
    setIsQrScannerOpen,
    darkMode,
    setDarkMode,
  } = useDashboard();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const commands = useMemo<Command[]>(() => {
    const roles = getUserRoles(user);
    const can = (route: string) =>
      hasAuthority(roles, ROUTE_PERMISSIONS[route] ?? []);

    const pages: Command[] = flattenNav(
      filterNavItems(mainNavItems, roles),
    ).map((page) => ({
      id: `page:${page.href}`,
      group: "Pages",
      label: page.label,
      icon: page.icon,
      hint: page.hint,
      run: () => router.push(page.href),
    }));

    const actions: Command[] = [
      ...(can("/events")
        ? [
            {
              id: "action:create-event",
              group: "Actions" as const,
              label: "Create event",
              icon: Plus,
              run: () => setIsCreateEventOpen(true),
            },
          ]
        : []),
      ...(can("/attendance")
        ? [
            {
              id: "action:qr-scanner",
              group: "Actions" as const,
              label: "Open QR check-in scanner",
              icon: QrCode,
              run: () => setIsQrScannerOpen(true),
            },
          ]
        : []),
      {
        id: "action:profile",
        group: "Actions",
        label: "My profile & password",
        icon: User,
        run: () => router.push("/settings?tab=profile"),
      },
      ...(hasAuthority(roles, [ROLES.SUPER_ADMIN, ROLES.ADMIN])
        ? [
            {
              id: "action:church-settings",
              group: "Actions" as const,
              label: "Church settings & branding",
              icon: Settings,
              run: () => router.push("/settings?tab=church-info"),
            },
          ]
        : []),
      {
        id: "action:theme",
        group: "Actions",
        label: darkMode ? "Switch to light mode" : "Switch to dark mode",
        icon: darkMode ? Sun : Moon,
        run: () => setDarkMode(!darkMode),
      },
    ];

    return [...pages, ...actions];
  }, [
    user,
    router,
    darkMode,
    setDarkMode,
    setIsCreateEventOpen,
    setIsQrScannerOpen,
  ]);

  const q = query.trim().toLowerCase();
  const results = q
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.hint?.toLowerCase().includes(q),
      )
    : commands;

  const close = () => {
    setIsSearchOpen(false);
    setQuery("");
  };

  const onSelect = (command: Command | null) => {
    if (!command) return;
    close();
    command.run();
  };

  return (
    <Dialog open={isSearchOpen} onClose={close} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-150 data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-start justify-center px-4 pt-16 sm:pt-24">
        <DialogPanel
          transition
          className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          <Combobox onChange={onSelect}>
            <div className="flex items-center border-b border-border-subtle px-4 py-3">
              <Search
                className="mr-3 h-5 w-5 shrink-0 text-fg-subtle"
                aria-hidden="true"
              />
              <ComboboxInput
                autoFocus
                aria-label="Jump to a page or action"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page or action…"
                className="w-full bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none"
              />
              <kbd className="ml-2 rounded border border-border-control bg-muted px-2 py-0.5 font-mono text-2xs text-fg-muted">
                ESC
              </kbd>
            </div>

            {results.length > 0 ? (
              <ComboboxOptions
                static
                className="max-h-80 space-y-3 overflow-y-auto p-3 text-xs"
              >
                {(["Pages", "Actions"] as const).map((group) => {
                  const items = results.filter((c) => c.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group}>
                      <p className="mb-1.5 px-2 text-2xs font-bold uppercase text-fg-subtle">
                        {group}
                      </p>
                      {items.map((command) => (
                        <ComboboxOption
                          key={command.id}
                          value={command}
                          className="group flex cursor-pointer items-center justify-between rounded-xl p-2.5 font-medium text-fg-secondary data-focus:bg-muted data-focus:text-fg"
                        >
                          <span className="flex items-center gap-2.5">
                            <command.icon className="h-4 w-4 text-primary-text" />
                            {command.label}
                            {command.hint && (
                              <span className="text-2xs text-fg-subtle">
                                {command.hint}
                              </span>
                            )}
                          </span>
                          <ArrowRight className="h-4 w-4 text-fg-subtle opacity-0 group-data-focus:opacity-100" />
                        </ComboboxOption>
                      ))}
                    </div>
                  );
                })}
              </ComboboxOptions>
            ) : (
              <p className="p-6 text-center text-xs text-fg-muted">
                Nothing matches &quot;{query}&quot;
              </p>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
