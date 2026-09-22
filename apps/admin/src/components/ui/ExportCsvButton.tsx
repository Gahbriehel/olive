"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";

interface ExportCsvButtonProps {
  endpoint: string;
  params?: Record<string, unknown>;
  fallbackFilename: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ExportCsvButton({
  endpoint,
  params,
  fallbackFilename,
  label = "Export CSV",
  className,
  disabled,
}: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCsvExport(endpoint, params, fallbackFilename);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      loading={isExporting}
      disabled={disabled}
      leftIcon={<Download className="w-4 h-4" />}
      className={className}
    >
      {label}
    </Button>
  );
}
