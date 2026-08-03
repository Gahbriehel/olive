"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { SettingsView } from "@/components/views/SettingsView";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "church-info";
  const { settings, updateSettings, isLoadingSettings } = useSettings();

  if (isLoadingSettings && !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SettingsView
      settings={settings}
      onSaveSettings={updateSettings}
      defaultTab={tab}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
