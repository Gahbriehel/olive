"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Church, Sun, Moon, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { mainNavItems, type NavItem } from "@/helpers/navlinks";
import { getUserRoles, hasAuthority } from "@/utils/rbac";

function isRouteActive(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  return (
    pathname === href ||
    (href !== "/dashboard" && href !== "/" && pathname.startsWith(`${href}/`))
  );
}

function containsActivePath(subs: NavItem[], pathname: string): boolean {
  return subs.some(
    (sub) =>
      isRouteActive(sub.href, pathname) ||
      (sub.subs ? containsActivePath(sub.subs, pathname) : false),
  );
}

function filterNavItems(items: NavItem[], userRoles: string[]): NavItem[] {
  return items
    .filter((item) => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return hasAuthority(userRoles, item.allowedRoles);
      }
      return true;
    })
    .map((item) => {
      if (item.subs) {
        return {
          ...item,
          subs: filterNavItems(item.subs, userRoles),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.subs && item.subs.length === 0 && !item.href) {
        return false;
      }
      return true;
    });
}

interface NavItemLinkProps {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  isSubItem?: boolean;
}

const NavItemLink: React.FC<NavItemLinkProps> = ({
  item,
  pathname,
  onNavigate,
  isSubItem = false,
}) => {
  const Icon = item.icon;
  const isActive = isRouteActive(item.href, pathname);

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        "w-full flex items-center justify-between text-xs transition-all duration-150 group",
        isSubItem
          ? "px-2.5 py-2 rounded-lg font-medium min-h-[36px]"
          : "px-3 py-2.5 rounded-xl font-semibold min-h-[42px]",
        isActive
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-slate-100",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={clsx(
            "transition-transform group-hover:scale-110",
            isSubItem ? "w-3.5 h-3.5" : "w-4 h-4",
            isActive ? "text-white" : "text-slate-400 dark:text-slate-500",
          )}
        />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span
          className={clsx(
            "px-1.5 py-0.5 text-[10px] rounded-md font-mono font-semibold",
            isActive
              ? "bg-white/20 text-white"
              : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400",
          )}
        >
          {item.badge}
        </span>
      )}
      {item.highlight && !isActive && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </Link>
  );
};

interface NavSubMenuProps {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  depth?: number;
}

const NavSubMenu: React.FC<NavSubMenuProps> = ({
  item,
  pathname,
  onNavigate,
  depth = 0,
}) => {
  const Icon = item.icon;
  const subs = useMemo(() => item.subs ?? [], [item.subs]);

  const hasActiveChild = useMemo(() => {
    return containsActivePath(subs, pathname);
  }, [subs, pathname]);

  const [isManualExpanded, setIsManualExpanded] = useState<boolean | null>(
    null,
  );
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsManualExpanded(null);
  }

  const isOpen = isManualExpanded !== null ? isManualExpanded : hasActiveChild;

  const toggleOpen = useCallback(() => {
    setIsManualExpanded((prev) => {
      const current = prev !== null ? prev : hasActiveChild;
      return !current;
    });
  }, [hasActiveChild]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group min-h-[42px] cursor-pointer",
          hasActiveChild
            ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-slate-100",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={clsx(
              "w-4 h-4 transition-transform group-hover:scale-110",
              hasActiveChild
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500",
            )}
          />
          <span>{item.label}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 dark:text-slate-500 flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1 border-l-2 border-slate-200 dark:border-zinc-800 ml-5 pl-2.5 py-0.5">
              {subs.map((sub) =>
                sub.subs && sub.subs.length > 0 ? (
                  <NavSubMenu
                    key={sub.label}
                    item={sub}
                    pathname={pathname}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                  />
                ) : (
                  <NavItemLink
                    key={sub.href || sub.label}
                    item={sub}
                    pathname={pathname}
                    onNavigate={onNavigate}
                    isSubItem
                  />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen, darkMode, setDarkMode } =
    useDashboard();
  const { settings } = useSettings();
  const { user } = useAuth();

  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const visibleNavItems = useMemo(
    () => filterNavItems(mainNavItems, userRoles),
    [userRoles],
  );

  const churchName =
    settings?.churchName || user?.church?.name || "Church Events";

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-slate-900 dark:text-white tracking-tight truncate">
              {churchName}
            </h1>
            <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              Admin Portal
            </p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Modules
          </p>
          <nav className="space-y-1">
            {visibleNavItems.map((item) =>
              item.subs && item.subs.length > 0 ? (
                <NavSubMenu
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setIsMobileOpen(false)}
                />
              ) : (
                <NavItemLink
                  key={item.href || item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={() => setIsMobileOpen(false)}
                />
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            SaaS v1.4.2
          </p>
          <p className="text-[10px]">Multi-Church Engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            title="System Operational"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 z-30">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer Sheet */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 animate-slide-in-right">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
