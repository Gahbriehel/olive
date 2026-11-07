"use client";

import React, { useMemo, useState } from "react";
import { BookMarked, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useScriptures } from "@/hooks/useScriptures";
import {
  SCRIPTURE_KIND_LABEL,
  Scripture,
  ScriptureKind,
} from "@/models/scripture";
import { ScriptureCard } from "./_components/ScriptureCard";
import { ScriptureFormModal } from "./_components/ScriptureFormModal";
import { groupScriptures } from "./_components/scriptureUtils";

const TABS = [
  { id: "WEEK", label: SCRIPTURE_KIND_LABEL.WEEK },
  { id: "YEAR", label: SCRIPTURE_KIND_LABEL.YEAR },
];

const EMPTY_COPY: Record<ScriptureKind, string> = {
  WEEK: "Nothing is showing for this week yet. Members won't see a scripture until you add one.",
  YEAR: "Nothing is showing for this year yet. Members won't see a scripture until you add one.",
};

type FormState = { open: boolean; scripture: Scripture | null };

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold text-fg">{title}</h2>
        {hint && <p className="text-xs text-fg-muted">{hint}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function ScripturesPage() {
  const [kind, setKind] = useState<ScriptureKind>("WEEK");
  const {
    scriptures,
    isLoading,
    isError,
    error,
    refetch,
    createScripture,
    updateScripture,
    deleteScripture,
    isDeleting,
  } = useScriptures(kind);

  const [form, setForm] = useState<FormState>({ open: false, scripture: null });
  const [deleting, setDeleting] = useState<Scripture | null>(null);

  const groups = useMemo(() => groupScriptures(scriptures), [scriptures]);
  const label = SCRIPTURE_KIND_LABEL[kind];

  const openAdd = () => setForm({ open: true, scripture: null });
  const openEdit = (scripture: Scripture) => setForm({ open: true, scripture });
  const closeForm = () => setForm({ open: false, scripture: null });

  const card = (s: Scripture) => (
    <ScriptureCard
      key={s.id}
      scripture={s}
      onEdit={openEdit}
      onDelete={setDeleting}
    />
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Scripture"
        description="The scripture of the week and of the year, shown at the top of the member app home page."
        icon={BookMarked}
        actions={
          <ListToolbar
            create={{
              label: "Add Scripture",
              onClick: openAdd,
              icon: <Plus className="h-4 w-4" />,
              show: true,
            }}
            actions={[{ title: "Refresh", fn: () => refetch() }]}
          />
        }
      />

      <Tabs
        label="Scripture type"
        tabs={TABS}
        activeTab={kind}
        onChange={(id) => setKind(id as ScriptureKind)}
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={scriptures.length === 0}
        resource="scriptures"
        loading={
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
        empty={
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="max-w-md text-sm text-fg-muted">{EMPTY_COPY[kind]}</p>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
              Add Scripture
            </Button>
          </div>
        }
      >
        <div className="space-y-8">
          <Section title="Live now">
            {groups.live ? (
              card(groups.live)
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-xs text-fg-muted">
                No scripture is live for {label.toLowerCase()}. Members don’t
                see this tab.
              </p>
            )}
          </Section>

          {groups.scheduled.length > 0 && (
            <Section
              title="Scheduled"
              hint="Published and waiting for their start date."
            >
              {groups.scheduled.map(card)}
            </Section>
          )}

          {groups.pastAndDrafts.length > 0 && (
            <Section title="Past / Drafts">
              {groups.pastAndDrafts.map(card)}
            </Section>
          )}
        </div>
      </QueryState>

      {form.open && (
        <ScriptureFormModal
          key={form.scripture?.id ?? "new"}
          isOpen
          onClose={closeForm}
          kind={kind}
          scripture={form.scripture}
          live={groups.live}
          onSubmit={async (payload) => {
            if (form.scripture) {
              // `kind` can't change after creation, so it isn't sent on edit.
              const { kind: _kind, ...rest } = payload;
              void _kind;
              await updateScripture({ id: form.scripture.id, payload: rest });
            } else {
              await createScripture(payload);
            }
          }}
        />
      )}

      <ConfirmActionModal
        display={Boolean(deleting)}
        close={() => setDeleting(null)}
        fn={async () => {
          if (deleting) await deleteScripture(deleting.id);
        }}
        title={
          deleting ? `Delete "${deleting.reference}"?` : "Delete scripture"
        }
        description={
          deleting?.isCurrent ? (
            <>
              <span className="font-semibold text-danger-text">
                Warning: This is the live scripture currently displayed to
                members. Deleting it will restore the previous published
                scripture as live.
              </span>
              <br />
              Are you sure you want to delete this scripture? This action cannot
              be undone.
            </>
          ) : (
            "Are you sure you want to delete this scripture? This action cannot be undone."
          )
        }
        confirmLabel="Delete Scripture"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}
