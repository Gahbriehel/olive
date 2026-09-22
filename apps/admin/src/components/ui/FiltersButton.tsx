"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { secondaryToolbarButtonClass } from "@/components/ui/ListToolbar";

export interface FiltersButtonProps {
  onClick: () => void;
  activeCount?: number;
  label?: string;
}

export function FiltersButton({
  onClick,
  activeCount = 0,
  label = "Filters",
}: FiltersButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={secondaryToolbarButtonClass}
      leftIcon={<SlidersHorizontal className="w-4 h-4" />}
    >
      {label}
      {activeCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold dark:bg-indigo-950/50 dark:text-indigo-300">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
