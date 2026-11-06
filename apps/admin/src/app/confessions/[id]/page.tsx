"use client";

import React from "react";
import { useParams } from "next/navigation";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConfessionDetail } from "@/hooks/useConfessions";
import { ConfessionEditor } from "../_components/ConfessionEditor";

export default function ConfessionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { confession, isLoading, isError, error, refetch } =
    useConfessionDetail(id);

  if (isNew) return <ConfessionEditor />;

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!confession}
      resource="confession"
      loading={<Skeleton className="h-96 w-full" />}
      empty={
        <p className="py-10 text-center text-sm text-fg-muted">
          This confession could not be found.
        </p>
      }
    >
      {confession && (
        // Keyed so a slug rename or refetch resets the form to server values.
        <ConfessionEditor key={confession.id} confession={confession} />
      )}
    </QueryState>
  );
}
