"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X, Church } from "lucide-react";
import { clsx } from "clsx";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { mainNavItems } from "@/helpers/navlinks";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen, settings, events, selectedEventId } =
    useDashboard();
  const { user } = useAuth();

  const churchName =
    settings?.churchName || user?.church?.name || "Church Events";
  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-slate-900 dark:text-white tracking-tight truncate">
              {churchName}
            </h1>
            <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              Events Platform
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

      {/* Active Phase Banner */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
          <div className="text-[11px] truncate">
            <p className="font-semibold text-indigo-900 dark:text-indigo-200 truncate">
              {activeEvent?.name || "No Active Event"}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400">
              Phase 1 Live Operations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Core Modules
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/events" && pathname.startsWith("/events"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group min-h-[42px]",
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-slate-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-white"
                          : "text-slate-400 dark:text-slate-500",
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
            })}
          </nav>
        </div>

        {/* Future Architecture Modules */}
        {/* <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="px-3 mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Scalable Platform Modules
            </p>
            <Badge variant="indigo" size="sm">
              Phase 2
            </Badge>
          </div>
          <div className="space-y-1">
            {futureModules.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-400">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div> */}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            SaaS v1.4.2
          </p>
          <p className="text-[10px]">Multi-Church Engine</p>
        </div>
        <div
          className="w-2 h-2 rounded-full bg-emerald-500"
          title="System Operational"
        />
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
