"use client";

import React from "react";
import { Moon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNightPrayer } from "@/hooks/useNightPrayer";
import { NightPrayerForm } from "./_components/NightPrayerForm";
import { ExceptionsSection } from "./_components/ExceptionsSection";

export default function NightPrayerPage() {
  const { config, isLoading, isError, error, refetch, save } = useNightPrayer();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Night Prayer"
        description="The nightly prayer session members join from the app, and the pushes that remind them."
        icon={Moon}
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={false}
        resource="night prayer settings"
        loading={<Skeleton className="h-96 w-full" />}
      >
        {/* Keyed so a refetch after saving resets the form to server values. */}
        <NightPrayerForm
          key={config ? "configured" : "new"}
          config={config}
          onSave={save}
        />
      </QueryState>

      <ExceptionsSection />
    </div>
  );
}
