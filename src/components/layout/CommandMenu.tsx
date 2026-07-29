"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Ticket,
  Shield,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export const CommandMenu: React.FC = () => {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen } = useDashboard();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const quickActions = [
    {
      label: "Go to Attendance Live Check-in",
      href: "/attendance",
      icon: Search,
    },
    {
      label: "View Registrations Directory",
      href: "/registrations",
      icon: Ticket,
    },
    { label: "Open Team Management & Drag-Drop", href: "/teams", icon: Shield },
    {
      label: "Check Leaderboard Standings",
      href: "/leaderboard",
      icon: Gamepad2,
    },
    { label: "Manage Games & Enter Scores", href: "/games", icon: Gamepad2 },
    { label: "Church Settings & Branding", href: "/settings", icon: Calendar },
  ];

  const searchResults = [
    {
      type: "Person",
      title: "Jordan Miller",
      detail: "Member • Team Tempest • YC26-1001",
      href: "/people",
    },
    {
      type: "Person",
      title: "Chloe Bennett",
      detail: "Visitor • Team Lumin • YC26-1002",
      href: "/people",
    },
    {
      type: "Event",
      title: "Youth Conference 2026: IGNITE",
      detail: "1,248 Registered • Live",
      href: "/events/evt-1",
    },
    {
      type: "Team",
      title: "Team Tempest",
      detail: "Cyan • 314 Members • 1,620 Points",
      href: "/teams",
    },
  ].filter(
    (r) =>
      query === "" ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.detail.toLowerCase().includes(query.toLowerCase()),
  );

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search attendees, teams, events..."
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded border border-slate-200 dark:border-zinc-700 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-4 text-xs">
          {query.length > 0 ? (
            <div>
              <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase">
                Search Results
              </p>
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(res.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {res.title}
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] rounded font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {res.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {res.detail}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-slate-400">
                  No matching records found for &quot;{query}&quot;
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleNavigate(action.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-slate-200 text-left font-medium"
                  >
                    <span className="flex items-center gap-2.5">
                      <action.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      {action.label}
                    </span>
                    <kbd className="text-[10px] font-mono text-slate-400">
                      ↵
                    </kbd>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
