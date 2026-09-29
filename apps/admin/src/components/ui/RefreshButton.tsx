"use client";

import React, { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { cn } from "@/helpers/cn";

export interface RefreshButtonProps {
  onRefetch?: () => void | Promise<unknown>;
  className?: string;
  variant?: "outline" | "primary" | "secondary" | "white" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  showText?: boolean;
  text?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefetch,
  className,
  showText = false,
  text = "Refresh",
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  if (!onRefetch) return null;

  const handleClick = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      await onRefetch();
    } catch (error) {
      console.error("Refetch error:", error);
    } finally {
      const elapsed = Date.now() - startTime;
      const minDuration = 600; // guarantee visible spinning feedback
      const delay = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        setIsRefreshing(false);
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 1500);
      }, delay);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-slate-300 dark:hover:bg-zinc-700 dark:hover:text-slate-100 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed",
        showText ? "px-3 gap-1.5 text-xs font-semibold" : "w-9 p-0",
        className,
      )}
      title={isRefreshing ? "Refreshing data..." : "Refresh Data"}
    >
      {justRefreshed ? (
        <Check className="w-4 h-4 text-emerald-500 transition-transform scale-110 shrink-0" />
      ) : (
        <RefreshCw
          className={`w-4 h-4 shrink-0 transition-transform ${
            isRefreshing
              ? "animate-spin text-indigo-500 dark:text-indigo-400"
              : ""
          }`}
        />
      )}
      {showText && (
        <span>
          {isRefreshing ? "Refreshing..." : justRefreshed ? "Updated!" : text}
        </span>
      )}
    </button>
  );
};
