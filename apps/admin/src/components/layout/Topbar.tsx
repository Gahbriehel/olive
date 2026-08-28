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
      <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-2.5 sm:px-5 lg:px-6 flex items-center justify-between transition-colors">
        {/* Left section: Hamburger & Event Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
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
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 min-h-[36px] sm:min-h-[38px] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-[200px] truncate">
                {activeEvent ? activeEvent.name : "Select Event"}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            </button>

            {isEventMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Event Context
                </div>
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id);
                      setIsEventMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                  >
                    <span className="truncate">{evt.name}</span>
                    {selectedEventId === evt.id && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
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
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-all border border-transparent hover:border-slate-300 dark:hover:border-zinc-700 min-h-[40px]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search people, registrations, teams...</span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-900 text-slate-500 rounded border border-slate-200 dark:border-zinc-700">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Mobile search icon — only visible below md */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-1.5 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
          {/* Theme Switcher — hidden on small screens (< sm) to prevent topbar overflow */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
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
              className="relative p-1.5 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 animate-fade-in">
                <div className="pb-2 mb-3 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifications
                  </span>
                </div>
                <div className="py-6 flex flex-col items-center gap-2 text-center">
                  <Bell className="w-7 h-7 text-slate-300 dark:text-zinc-600" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    No notifications yet
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
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
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors min-h-[38px] sm:min-h-[44px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentRole}
                </p>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 animate-fade-in">
                <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <TruncatedTextWithCopy
                    text={user?.email || ""}
                    maxLength={24}
                    textClassName="text-[11px] text-slate-400"
                  />
                </div>

                <div className="py-1 border-b border-slate-100 dark:border-zinc-800 text-xs space-y-0.5">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium sm:hidden"
                  >
                    <div className="flex items-center gap-2">
                      {darkMode ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {darkMode ? "Dark" : "Light"}
                    </span>
                  </button>

                  <Link
                    href="/settings?tab=profile"
                    onClick={() => setIsRoleMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/settings?tab=church-info"
                      onClick={() => setIsRoleMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
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
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
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
        fn={logout}
      />
    </>
  );
};
