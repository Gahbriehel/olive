"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/FormElements/Input";
import { Select } from "@/components/FormElements/Select";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useConfessions } from "@/hooks/useConfessions";
import { ConfessionListItem } from "@/models/confession";
import { ConfessionsTable } from "./_components/ConfessionsTable";

const sameOrder = (a: ConfessionListItem[], b: ConfessionListItem[]) =>
  a.length === b.length && a.every((x, i) => x.id === b[i].id);

export default function ConfessionsPage() {
  const router = useRouter();
  const {
    confessions,
    categories,
    isLoading,
    isError,
    error,
    refetch,
    reorderConfessions,
    isReordering,
    deleteConfession,
    isDeleting,
  } = useConfessions();

  // Local copy so a drag reorders instantly; resynced whenever the server list changes.
  const [items, setItems] = useState<ConfessionListItem[]>(confessions);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(confessions);
  }, [confessions]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState<ConfessionListItem | null>(null);

  const isFiltered = Boolean(search.trim() || category || status);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (c) =>
        (!q ||
          c.title.toLowerCase().includes(q) ||
          c.scriptureRef?.toLowerCase().includes(q) ||
          c.excerpt?.toLowerCase().includes(q)) &&
        (!category || c.category === category) &&
        (!status || c.status === status),
    );
  }, [items, search, category, status]);

  const handleReorder = (next: ConfessionListItem[]) => {
    setItems(next);
    if (!sameOrder(next, confessions)) {
      reorderConfessions({ ids: next.map((c) => c.id) }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Confessions Library"
        description="Curate and order confessions for the member app. Drag rows to change the display order."
        icon={BookOpen}
        actions={
          <ListToolbar
            create={{
              label: "Add Confession",
              onClick: () => router.push("/confessions/new"),
              icon: <Plus className="h-4 w-4" />,
              show: true,
            }}
            actions={[{ title: "Refresh", fn: () => refetch() }]}
          />
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_160px]">
        <Input
          aria-label="Search confessions"
          placeholder="Search confessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          onClear={() => setSearch("")}
        />
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category: All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="PUBLISHED">Live</option>
          <option value="DRAFT">Draft</option>
        </Select>
      </div>

      {isFiltered && (
        <p className="text-xs text-fg-muted">
          Reordering is turned off while a filter is applied. Clear the filters
          to drag rows.
        </p>
      )}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={visible.length === 0}
        resource="confessions"
        loading={
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        }
        empty={
          <p className="py-10 text-center text-sm text-fg-muted">
            {isFiltered
              ? "No confessions match your filters."
              : "No confessions yet. Add the first one to get started."}
          </p>
        }
      >
        <ConfessionsTable
          items={visible}
          canReorder={!isFiltered}
          busy={isReordering}
          onReorder={handleReorder}
          onDelete={setDeleting}
        />
      </QueryState>

      <ConfirmActionModal
        display={Boolean(deleting)}
        close={() => setDeleting(null)}
        fn={async () => {
          if (deleting) await deleteConfession(deleting.id);
        }}
        title={deleting ? `Delete "${deleting.title}"?` : "Delete confession"}
        description="This permanently removes the confession and its audio files. This cannot be undone."
        confirmLabel="Delete Confession"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}
