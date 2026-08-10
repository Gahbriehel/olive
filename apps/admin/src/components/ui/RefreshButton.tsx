"use client";

import React, { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  className = "px-3",
  variant = "outline",
  size,
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
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isRefreshing}
      className={className}
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
        <span className="text-xs font-semibold">
          {isRefreshing ? "Refreshing..." : justRefreshed ? "Updated!" : text}
        </span>
      )}
    </Button>
  );
};
