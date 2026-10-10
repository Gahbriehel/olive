"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Calendar,
  User,
  Settings,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.substring(0, 2).toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return "U";
};

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
    isMobileOpen,
    setIsSearchOpen,
  } = useDashboard();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  // Refs for outside-click detection
  const eventMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const closeEventMenu = useCallback(() => setIsEventMenuOpen(false), []);
  const closeNotif = useCallback(() => setIsNotifOpen(false), []);
  const closeRoleMenu = useCallback(() => setIsRoleMenuOpen(false), []);

  useClickOutside(eventMenuRef, closeEventMenu, isEventMenuOpen);
  useClickOutside(notifRef, closeNotif, isNotifOpen);
  useClickOutside(roleMenuRef, closeRoleMenu, isRoleMenuOpen);

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
      <header className="sticky top-0 z-20 h-16 bg-surface/90 backdrop-blur-md border-b border-border px-2.5 sm:px-5 lg:px-6 flex items-center justify-between transition-colors">
        {/* Left section: Hamburger & Event Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-fg-secondary hover:bg-muted rounded-xl min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Current Event Selector */}
          <div className="relative" ref={eventMenuRef}>
            <button
              onClick={() => {
                setIsEventMenuOpen((v) => !v);
                setIsNotifOpen(false);
                setIsRoleMenuOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-border bg-subtle hover:bg-muted transition-colors text-2xs sm:text-xs font-semibold text-fg min-h-[36px] sm:min-h-[38px] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-text shrink-0" />
              <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-[200px] truncate">
                {activeEvent ? activeEvent.name : "Select Event"}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-fg-subtle shrink-0" />
            </button>

            {isEventMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-2xs font-bold text-fg-subtle uppercase tracking-wider">
                  Select Active Event Context
                </div>
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id);
                      setIsEventMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-fg-secondary hover:bg-muted rounded-xl transition-colors text-left"
                  >
                    <span className="truncate">{evt.name}</span>
                    {selectedEventId === evt.id && (
                      <Check className="w-4 h-4 text-primary-text shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search input button */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted text-fg-subtle hover:text-fg-secondary text-xs transition-all border border-transparent hover:border-border-control min-h-[40px]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-fg-subtle" />
              <span>Search people, registrations, teams...</span>
            </div>
            <span className="px-1.5 py-0.5 text-2xs font-mono bg-surface text-fg-muted rounded border border-border-control">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Mobile search icon — only visible below md */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-1.5 sm:p-2.5 text-fg-secondary hover:bg-muted rounded-xl transition-colors min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
          {/* Theme Switcher — hidden on small screens (< sm) to prevent topbar overflow */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2.5 text-fg-secondary hover:bg-muted rounded-xl transition-colors min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-warning" />
            ) : (
              <Moon className="w-5 h-5 text-fg-secondary" />
            )}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen((v) => !v);
                setIsEventMenuOpen(false);
                setIsRoleMenuOpen(false);
              }}
              className="relative p-1.5 sm:p-2.5 text-fg-secondary hover:bg-muted rounded-xl transition-colors min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 animate-fade-in">
                <div className="pb-2 mb-3 border-b border-border-subtle">
                  <span className="text-xs font-bold text-fg">
                    Notifications
                  </span>
                </div>
                <div className="py-6 flex flex-col items-center gap-2 text-center">
                  <Bell className="w-7 h-7 text-fg-subtle" />
                  <p className="text-xs font-medium text-fg-muted">
                    No notifications yet
                  </p>
                  <p className="text-2xs text-fg-subtle">
                    Alerts will appear here when available.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => {
                setIsRoleMenuOpen((v) => !v);
                setIsEventMenuOpen(false);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-muted transition-colors min-h-[38px] sm:min-h-[44px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary text-white font-bold text-2xs sm:text-xs flex items-center justify-center shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight text-fg max-w-[120px] truncate">
                  {displayName}
                </p>
                <p className="text-2xs text-primary-text font-medium">
                  {currentRole}
                </p>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-fg-subtle" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl p-3 z-50 animate-fade-in">
                <div className="pb-2.5 mb-2.5 border-b border-border-subtle">
                  <p className="text-xs font-bold text-fg truncate">
                    {displayName}
                  </p>
                  <TruncatedTextWithCopy
                    text={user?.email || ""}
                    maxLength={24}
                    textClassName="text-2xs text-fg-subtle"
                  />
                </div>

                <div className="py-1 border-b border-border-subtle text-xs space-y-0.5">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-fg-secondary hover:bg-muted transition-colors font-medium sm:hidden"
                  >
                    <div className="flex items-center gap-2">
                      {darkMode ? (
                        <Sun className="w-3.5 h-3.5 text-warning" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-fg-muted" />
                      )}
                      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <span className="text-2xs text-fg-subtle font-semibold">
                      {darkMode ? "Dark" : "Light"}
                    </span>
                  </button>

                  <Link
                    href="/settings?tab=profile"
                    onClick={() => setIsRoleMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-fg-secondary hover:bg-muted transition-colors font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-primary-text" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/settings?tab=church-info"
                      onClick={() => setIsRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-fg-secondary hover:bg-muted transition-colors font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-primary-text" />
                      Church Settings
                    </Link>
                  )}
                </div>

                <div className="pt-2 text-xs">
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      setConfirmSignOut(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-danger-text hover:bg-danger-soft transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
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
