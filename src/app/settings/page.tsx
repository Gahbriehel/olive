"use client";

import React from "react";
import { useSettings } from "@/hooks/useSettings";
import { SettingsView } from "@/components/views/SettingsView";

export default function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings();

  if (isLoading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SettingsView settings={settings} onSaveSettings={updateSettings} />;
}
