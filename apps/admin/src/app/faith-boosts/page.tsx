"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Edit2, Plus, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useEncouragements } from "@/hooks/useNotifications";
import { Encouragement } from "@/models/notifications";
import { EncouragementFormModal } from "./_components/EncouragementFormModal";
import { CadenceSettings } from "./_components/CadenceSettings";

dayjs.extend(relativeTime);

const LIMIT = 20;
type FormState = { open: boolean; item: Encouragement | null };

export default function FaithBoostsPage() {
  const [page, setPage] = useState(1);
  const {
    encouragements,
    total,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    createEncouragement,
    updateEncouragement,
    deleteEncouragement,
    isDeleting,
  } = useEncouragements(page, LIMIT);

  const [form, setForm] = useState<FormState>({ open: false, item: null });
  const [deleting, setDeleting] = useState<Encouragement | null>(null);
  const openAdd = () => setForm({ open: true, item: null });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Faith Boosts"
        description="Short messages pushed to members on a weekly rhythm. Never-sent messages go first, then the longest-unsent."
        icon={Sparkles}
        actions={
          <ListToolbar
            create={{
              label: "Add Message",
              onClick: openAdd,
              icon: <Plus className="h-4 w-4" />,
              show: true,
            }}
            actions={[{ title: "Refresh", fn: () => refetch() }]}
          />
        }
      />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={encouragements.length === 0}
        resource="faith boosts"
        loading={<Skeleton className="h-64 w-full" />}
        empty={
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="max-w-md text-sm text-fg-muted">
              No messages yet. Add some so members have something to receive.
            </p>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
              Add Message
            </Button>
          </div>
        }
      >
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-fg-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last sent</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {encouragements.map((e) => (
                <tr key={e.id}>
                  <td className="max-w-md px-4 py-3 text-fg">{e.text}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-fg-muted">
                    {e.reference || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge size="sm" variant={e.isActive ? "emerald" : "slate"}>
                      {e.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-fg-muted">
                    {e.lastSentAt
                      ? dayjs(e.lastSentAt).fromNow()
                      : "Never sent"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit message"
                      onClick={() => setForm({ open: true, item: e })}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete message"
                      onClick={() => setDeleting(e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={LIMIT}
            onPageChange={setPage}
          />
        )}
      </QueryState>

      <CadenceSettings />

      {form.open && (
        <EncouragementFormModal
          key={form.item?.id ?? "new"}
          encouragement={form.item}
          onClose={() => setForm({ open: false, item: null })}
          onSubmit={async (payload) => {
            if (form.item) {
              await updateEncouragement({ id: form.item.id, payload });
            } else {
              await createEncouragement(payload);
            }
          }}
        />
      )}

      <ConfirmActionModal
        display={Boolean(deleting)}
        close={() => setDeleting(null)}
        title="Delete this message?"
        description="It will no longer be picked for encouragement pushes. This cannot be undone."
        confirmLabel="Delete message"
        loading={isDeleting}
        fn={async () => {
          if (deleting) await deleteEncouragement(deleting.id);
        }}
      />
    </div>
  );
}
