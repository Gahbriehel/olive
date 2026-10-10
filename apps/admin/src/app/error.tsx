"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unhandled Admin Section Error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-xl text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-danger-soft text-danger-text flex items-center justify-center mx-auto border border-danger-border">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-fg tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-fg-muted leading-relaxed">
            An unexpected application error occurred in this view. Your session
            and data remain safe.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="p-3 bg-subtle rounded-xl border border-border-control text-2xs font-mono text-danger-text text-left overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
