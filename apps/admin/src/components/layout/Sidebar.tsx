"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Church, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { filterNavItems, mainNavItems, type NavItem } from "@/helpers/navlinks";
import { getUserRoles } from "@/utils/rbac";

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
          ? "bg-primary text-white shadow-sm shadow-primary/20 font-semibold"
          : "text-fg-secondary hover:bg-muted hover:text-fg",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={clsx(
            "transition-transform group-hover:scale-110",
            isSubItem ? "w-3.5 h-3.5" : "w-4 h-4",
            isActive ? "text-white" : "text-fg-subtle",
          )}
        />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span
          className={clsx(
            "px-1.5 py-0.5 text-2xs rounded-md font-mono font-semibold",
            isActive ? "bg-white/20 text-white" : "bg-muted text-fg-muted",
          )}
        >
          {item.badge}
        </span>
      )}
      {item.highlight && !isActive && (
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
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
            ? "bg-primary-soft text-primary-text font-bold"
            : "text-fg-secondary hover:bg-muted hover:text-fg",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={clsx(
              "w-4 h-4 transition-transform group-hover:scale-110",
              hasActiveChild ? "text-primary-text" : "text-fg-subtle",
            )}
          />
          <span>{item.label}</span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-fg-subtle flex items-center justify-center"
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
            <div className="mt-1 space-y-1 border-l-2 border-border ml-5 pl-2.5 py-0.5">
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
  const { isMobileOpen, setIsMobileOpen } = useDashboard();
  const { settings } = useSettings();
  const { user } = useAuth();

  const userRoles = useMemo(() => getUserRoles(user), [user]);
  const visibleNavItems = useMemo(
    () => filterNavItems(mainNavItems, userRoles),
    [userRoles],
  );

  const churchName =
    settings?.churchName || user?.church?.name || "Church Events";
  const closeMobile = () => setIsMobileOpen(false);

  const navContent = (isMobile: boolean) => (
    <div className="flex h-full flex-col border-r border-border bg-surface text-fg-secondary">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-border-subtle p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Church className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight tracking-tight text-fg">
              {churchName}
            </p>
            <p className="text-2xs font-medium text-primary-text">
              Admin Portal
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="rounded-xl p-2 text-fg-subtle hover:bg-muted hover:text-fg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p
          id={isMobile ? "nav-heading-mobile" : "nav-heading"}
          className="mb-2 px-3 text-2xs font-bold uppercase tracking-wider text-fg-subtle"
        >
          Modules
        </p>
        <nav
          aria-labelledby={isMobile ? "nav-heading-mobile" : "nav-heading"}
          className="space-y-1"
        >
          {visibleNavItems.map((item) =>
            item.subs && item.subs.length > 0 ? (
              <NavSubMenu
                key={item.label}
                item={item}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            ) : (
              <NavItemLink
                key={item.href || item.label}
                item={item}
                pathname={pathname}
                onNavigate={closeMobile}
              />
            ),
          )}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        {navContent(false)}
      </aside>

      {/* Mobile drawer: a real dialog (focus trap, Escape, scroll lock) sliding in from the left */}
      <Dialog
        open={isMobileOpen}
        onClose={closeMobile}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-200 ease-out data-closed:opacity-0"
        />
        <DialogPanel
          transition
          aria-label="Navigation"
          className="fixed inset-y-0 left-0 w-72 max-w-[80vw] transition duration-300 ease-out data-closed:-translate-x-full"
        >
          {navContent(true)}
        </DialogPanel>
      </Dialog>
    </>
  );
};
