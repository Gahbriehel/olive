"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";

/** Typed registration number or QR payload token. */
export function ManualEntryForm({
  onSubmit,
}: {
  onSubmit: (code: string) => void;
}) {
  const [manualCode, setManualCode] = useState<string>("");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onSubmit(manualCode.trim());
    setManualCode("");
  };

  return (
    <form onSubmit={handleManualSubmit} className="space-y-3">
      <Input
        label="Enter Registration Number or QR Payload Token:"
        placeholder="e.g. YC26-1001 or token string"
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
        autoFocus
      />
      <Button type="submit" variant="primary" className="w-full">
        Submit Check-In
      </Button>
    </form>
  );
}
