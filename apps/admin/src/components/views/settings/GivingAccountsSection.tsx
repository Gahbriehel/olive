"use client";

import React, { useEffect, useState } from "react";
import { Banknote, Edit2, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { QueryState } from "@/components/ui/QueryState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@headlessui/react";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { GivingAccountForm } from "@/components/Forms/GivingAccountForm";
import { useGivingAccounts } from "@/hooks/useGivingAccounts";
import {
  GIVING_PURPOSES,
  GivingAccount,
  CreateGivingAccountPayload,
} from "@/models/giving-account";
import { cn } from "@/helpers/cn";

const purposeLabel = (id: string) =>
  GIVING_PURPOSES.find((p) => p.id === id)?.label ?? id;

const maskAccountNumber = (n: string) =>
  n.length > 4 ? `${"•".repeat(n.length - 4)}${n.slice(-4)}` : n;

const sameOrder = (a: GivingAccount[], b: GivingAccount[]) =>
  a.length === b.length && a.every((x, i) => x.id === b[i].id);

/** Super Admin only: bank details shown in the member app's Giving screen. */
export const GivingAccountsSection: React.FC = () => {
  const {
    accounts,
    isLoading,
    isError,
    refetch,
    createAccount,
    updateAccount,
    reorderAccounts,
    deleteAccount,
    isCreating,
    isUpdating,
    isReordering,
  } = useGivingAccounts();

  // Local copy so a drag reorders instantly; resynced whenever the server list changes.
  const [items, setItems] = useState<GivingAccount[]>(accounts);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(accounts);
  }, [accounts]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<GivingAccount | null>(null);
  const [deleting, setDeleting] = useState<GivingAccount | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleCreate = async (payload: CreateGivingAccountPayload) => {
    try {
      await createAccount(payload);
      setIsCreateOpen(false);
    } catch {
      // Toasted by the API client; keep the form open.
    }
  };

  const handleUpdate = async (payload: CreateGivingAccountPayload) => {
    if (!editing) return;
    try {
      await updateAccount({ id: editing.id, payload });
      setEditing(null);
    } catch {
      // Toasted by the API client; keep the form open.
    }
  };

  const handleToggle = (a: GivingAccount, isActive: boolean) => {
    updateAccount({ id: a.id, payload: { isActive } }).catch(() => {});
  };

  const handleDrop = (targetId: string) => {
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from < 0 || to < 0 || from === to) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    if (!sameOrder(next, accounts)) {
      reorderAccounts({ ids: next.map((i) => i.id) }).catch(() => {});
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary-text" />
            Giving Accounts
          </CardTitle>
          <CardDescription>
            Bank details shown to members in the app. Drag to change the order
            they appear in.
          </CardDescription>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Add Account
        </Button>
      </CardHeader>

      <CardContent>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          isEmpty={items.length === 0}
          resource="giving accounts"
          loading={
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          }
          empty={
            <p className="py-10 text-center text-sm text-fg-muted">
              No giving accounts yet. Add one so members can see where to give.
            </p>
          }
        >
          <ul className="space-y-3" aria-busy={isReordering}>
            {items.map((a) => (
              <li
                key={a.id}
                draggable
                onDragStart={(e) => {
                  setDragId(a.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  setOverId(a.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(a.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors",
                  dragId === a.id && "opacity-50",
                  overId === a.id && dragId !== a.id && "border-primary",
                  !a.isActive && "bg-subtle",
                )}
              >
                <GripVertical
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 cursor-grab text-fg-subtle active:cursor-grabbing"
                />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-fg">{a.label}</span>
                    <Badge size="sm" variant="slate">
                      {a.currency}
                    </Badge>
                    {!a.isActive && (
                      <Badge size="sm" variant="amber">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-fg-secondary">
                    {a.bankName} · {a.accountName}
                  </p>
                  <p className="font-mono text-sm text-fg-muted">
                    {maskAccountNumber(a.accountNumber)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.purposes.map((p) => (
                      <Badge key={p} size="sm" variant="indigo">
                        {purposeLabel(p)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={a.isActive}
                    onChange={(v) => handleToggle(a, v)}
                    disabled={isUpdating}
                    aria-label={`${a.label} active`}
                    className={cn(
                      a.isActive ? "bg-success" : "bg-fg-subtle",
                      "relative mr-2 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        a.isActive ? "translate-x-5" : "translate-x-0",
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition",
                      )}
                    />
                  </Switch>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${a.label}`}
                    onClick={() => setEditing(a)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${a.label}`}
                    onClick={() => setDeleting(a)}
                  >
                    <Trash2 className="h-4 w-4 text-danger-text" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </QueryState>
      </CardContent>

      <SidebarModal
        title="Add Giving Account"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <GivingAccountForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreating}
        />
      </SidebarModal>

      <SidebarModal
        title="Edit Giving Account"
        isOpen={!!editing}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <GivingAccountForm
            account={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isLoading={isUpdating}
          />
        )}
      </SidebarModal>

      {deleting && (
        <ConfirmActionModal
          display
          close={() => setDeleting(null)}
          actionName="delete"
          title={`Delete ${deleting.label}?`}
          description="Members will no longer see this account. This cannot be undone. To hide it temporarily, mark it inactive instead."
          fn={async () => {
            await deleteAccount(deleting.id);
          }}
        />
      )}
    </Card>
  );
};
