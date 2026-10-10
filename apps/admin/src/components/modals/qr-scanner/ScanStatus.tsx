"use client";

import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ScanStatusProps {
  result: string | null;
  error: string | null;
  onDismissResult: () => void;
}

/** Success and error alerts shared by every scan mode. */
export function ScanStatus({
  result,
  error,
  onDismissResult,
}: ScanStatusProps) {
  return (
    <>
      {result && (
        <div
          role="status"
          className="p-3 rounded-xl bg-success-soft border border-success-border text-success-text font-bold flex items-center justify-between animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-text shrink-0" />
            <span>{result}</span>
          </div>
          <button
            type="button"
            onClick={onDismissResult}
            aria-label="Dismiss"
            className="rounded text-success-text opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-warning-soft border border-warning-border text-warning-text font-medium flex items-center gap-2 animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 text-warning-text shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
