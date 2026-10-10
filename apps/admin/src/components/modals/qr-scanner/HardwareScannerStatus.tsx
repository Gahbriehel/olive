"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useHardwareScanner } from "@/hooks/useHardwareScanner";

interface HardwareScannerStatusProps {
  enabled: boolean;
  onScan: (code: string) => void;
}

/**
 * Listens for USB/Bluetooth HID barcode scanners (active in every scan mode)
 * and shows that the listener is armed.
 */
export function HardwareScannerStatus({
  enabled,
  onScan,
}: HardwareScannerStatusProps) {
  useHardwareScanner({ enabled, onScan });

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary-soft border border-primary-border text-primary-text">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 text-primary-text animate-pulse shrink-0" />
        <span>Hardware Barcode Scanner Ready (USB / Bluetooth HID)</span>
      </div>
      <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-white">
        Auto-Detect
      </span>
    </div>
  );
}
