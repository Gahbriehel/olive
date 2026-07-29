"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { SettingsView } from "@/components/views/SettingsView";

export default function SettingsPage() {
  const { settings, handleUpdateSettings } = useDashboard();
  return (
    <SettingsView settings={settings} onSaveSettings={handleUpdateSettings} />
  );
}
