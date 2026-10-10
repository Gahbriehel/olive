"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
      leftIcon={<SlidersHorizontal className="w-4 h-4" />}
    >
      {label}
      {activeCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-soft text-primary-text text-2xs font-bold">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
