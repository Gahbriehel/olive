"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { SettingsView } from "@/components/views/SettingsView";

import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { LoadingState } from "@/components/ui/Spinner";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  const tab = searchParams.get("tab") || (isAdmin ? "church-info" : "profile");
  const { settings, updateSettings, isLoadingSettings, refetch } =
    useSettings();

  if (isLoadingSettings && !settings && isAdmin) {
    return <LoadingState label="Loading settings..." className="h-64" />;
  }

  return (
    <SettingsView
      settings={settings}
      onSaveSettings={updateSettings}
      defaultTab={tab}
      onRefetch={refetch}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={<LoadingState label="Loading settings..." className="h-64" />}
    >
      <SettingsContent />
    </Suspense>
  );
}
