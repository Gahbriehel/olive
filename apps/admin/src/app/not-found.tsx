"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  Ticket,
  QrCode,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminNotFound() {
  const router = useRouter();

  const quickLinks = [
    {
      href: "/dashboard",
      title: "Dashboard",
      description: "Overview & key platform stats",
      icon: LayoutDashboard,
    },
    {
      href: "/events",
      title: "Events",
      description: "Manage upcoming & live events",
      icon: Calendar,
    },
    {
      href: "/registrations",
      title: "Registrations",
      description: "Manage attendee list & passes",
      icon: Ticket,
    },
    {
      href: "/attendance",
      title: "Attendance Check-In",
      description: "Live QR scanner & check-ins",
      icon: QrCode,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl text-center space-y-8"
      >
        {/* Visual Badge & 404 Hero Header */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-4">
              <Compass className="w-8 h-8 sm:w-10 sm:h-10 animate-spin-slow" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Error 404 • Resource Not Found
            </span>

            <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400 bg-clip-text text-transparent">
                404
              </span>
            </h1>
          </div>
        </div>

        {/* Title & Description */}
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Admin Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The route you are trying to access does not exist, has been moved,
            or your role privileges restrict access to this page.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Page
          </button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800/80">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-left">
            Quick Navigation Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 text-slate-500 dark:text-slate-400 text-[11px] flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            If you believe this is a permission error, contact your Church Super
            Admin.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
