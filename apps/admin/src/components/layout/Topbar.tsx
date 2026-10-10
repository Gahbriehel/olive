"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  Menu as MenuIcon,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Check,
  LogOut,
  Calendar,
  User,
  Settings,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { cn } from "@/helpers/cn";

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.substring(0, 2).toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return "U";
};

const iconButton =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-fg-secondary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

const menuPanel =
  "z-50 rounded-2xl border border-border bg-surface p-2 shadow-xl transition duration-100 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0";

const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-fg-secondary data-focus:bg-muted";

export const Topbar: React.FC = () => {
  const { logout, user } = useAuth();
  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    currentRole,
    darkMode,
    setDarkMode,
    setIsMobileOpen,
    setIsSearchOpen,
  } = useDashboard();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User Profile";
  const userInitials = getInitials(
    user?.firstName,
    user?.lastName,
    user?.email,
  );

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border bg-surface/90 px-2.5 backdrop-blur-md sm:px-5 lg:px-6">
        {/* Left: navigation toggle + event context */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className={cn(iconButton, "lg:hidden")}
            aria-label="Open navigation"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Listbox
            value={activeEvent?.id ?? ""}
            onChange={(id: string) => setSelectedEventId(id)}
          >
            <ListboxButton
              aria-label="Active event"
              className="flex min-h-[38px] min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-subtle px-2 py-1 text-xs font-semibold text-fg transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:gap-2 sm:px-3 sm:py-1.5"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary-text" />
              <span className="max-w-[110px] truncate sm:max-w-[200px]">
                {activeEvent ? activeEvent.name : "Select event"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom start"
              transition
              className={cn(menuPanel, "w-64")}
            >
              <div className="px-2.5 py-1.5 text-2xs font-bold uppercase tracking-wider text-fg-subtle">
                Active event
              </div>
              {events.length === 0 ? (
                <p className="px-2.5 py-2 text-xs text-fg-muted">
                  No events yet
                </p>
              ) : (
                events.map((evt) => (
                  <ListboxOption
                    key={evt.id}
                    value={evt.id}
                    className={cn(menuItem, "justify-between")}
                  >
                    {({ selected }) => (
                      <>
                        <span className="truncate">{evt.name}</span>
                        {selected && (
                          <Check className="h-4 w-4 shrink-0 text-primary-text" />
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))
              )}
            </ListboxOptions>
          </Listbox>
        </div>

        {/* Center: command palette trigger */}
        <div className="mx-6 hidden max-w-md flex-1 items-center md:flex">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-muted px-3.5 py-2 text-xs text-fg-muted transition-all hover:border-border-control hover:text-fg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-fg-subtle" />
              Jump to a page or action…
            </span>
            <kbd className="rounded border border-border-control bg-surface px-1.5 py-0.5 font-mono text-2xs text-fg-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: search (mobile), theme, profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={cn(iconButton, "md:hidden")}
            aria-label="Jump to a page or action"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={iconButton}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <Menu>
            <MenuButton
              aria-label="Account menu"
              className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:p-1.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm">
                {userInitials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[120px] truncate text-xs font-semibold leading-tight text-fg">
                  {displayName}
                </span>
                <span className="block text-2xs font-medium text-primary-text">
                  {currentRole}
                </span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-fg-subtle sm:block" />
            </MenuButton>

            <MenuItems
              anchor="bottom end"
              transition
              className={cn(menuPanel, "w-64")}
            >
              <div className="mb-1.5 border-b border-border-subtle px-2.5 pb-2.5 pt-1">
                <p className="truncate text-xs font-bold text-fg">
                  {displayName}
                </p>
                <TruncatedTextWithCopy
                  text={user?.email || ""}
                  maxLength={24}
                  textClassName="text-2xs text-fg-muted"
                />
              </div>
              <MenuItem>
                <Link href="/settings?tab=profile" className={menuItem}>
                  <User className="h-3.5 w-3.5 text-primary-text" />
                  My profile
                </Link>
              </MenuItem>
              {isAdmin && (
                <MenuItem>
                  <Link href="/settings?tab=church-info" className={menuItem}>
                    <Settings className="h-3.5 w-3.5 text-primary-text" />
                    Church settings
                  </Link>
                </MenuItem>
              )}
              <div className="my-1.5 border-t border-border-subtle" />
              <MenuItem>
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(true)}
                  className={cn(
                    menuItem,
                    "text-danger-text data-focus:bg-danger-soft",
                  )}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </header>

      <ConfirmActionModal
        display={confirmSignOut}
        close={() => setConfirmSignOut(false)}
        actionName="logout"
        title="Are you sure you want to sign out?"
        description="You'll need to sign in again to continue."
        confirmLabel="Sign out"
        fn={logout}
      />
    </>
  );
};
