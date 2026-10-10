"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { SettingsView } from "@/components/views/SettingsView";

import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { Spinner } from "@/components/ui/Spinner";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  const tab = searchParams.get("tab") || (isAdmin ? "church-info" : "profile");
  const { settings, updateSettings, isLoadingSettings, refetch } =
    useSettings();

  if (isLoadingSettings && !settings && isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
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
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
