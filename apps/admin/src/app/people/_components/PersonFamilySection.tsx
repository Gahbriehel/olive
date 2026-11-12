"use client";

import { useState } from "react";
import { Users, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select, type ISelect } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddRelative,
  useRelatives,
  useRemoveRelative,
} from "@/hooks/usePeople";
import { usePeopleSelectQuery } from "@/hooks/usePeopleSelect";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import {
  IPerson,
  IRelative,
  RELATIONSHIP_LABELS,
  RelationshipType,
} from "@/models/person";

const RELATIONSHIP_OPTIONS: ISelect[] = (
  Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]
).map((value) => ({
  value: { _id: value },
  label: RELATIONSHIP_LABELS[value],
}));

const EMPTY_SELECT: ISelect = { value: { _id: "" }, label: "" };
const NOTE_MAX = 100;

function AddRelativeModal({
  person,
  onClose,
}: {
  person: IPerson;
  onClose: () => void;
}) {
  const addRelative = useAddRelative(person.id);
  const [related, setRelated] = useState<ISelect>(EMPTY_SELECT);
  const [relationship, setRelationship] = useState<ISelect>(
    RELATIONSHIP_OPTIONS[0],
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isOther = relationship.value._id === "OTHER";
  const relatedId = related.value._id;
  const canSubmit = Boolean(relatedId) && !addRelative.isPending;

  const handleSubmit = async () => {
    setError(null);
    if (relatedId === person.id) {
      setError("A person can't be linked to themselves.");
      return;
    }
    try {
      await addRelative.mutateAsync({
        relatedPersonId: relatedId,
        relationship: relationship.value._id as RelationshipType,
        relationshipNote: isOther && note.trim() ? note.trim() : null,
      });
      onClose();
    } catch {
      // API errors (e.g. RELATIONSHIP_ALREADY_EXISTS) are toasted by the API client.
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Link a relative to ${person.name}`}
      maxWidth="md"
      footerStart={
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
      }
      footer={
        <Button
          type="button"
          disabled={!canSubmit}
          loading={addRelative.isPending}
          onClick={handleSubmit}
        >
          Add link
        </Button>
      }
    >
      <div className="space-y-4">
        <Select
          label="Person"
          placeholder="Search people"
          value={related}
          onChange={setRelated}
          queryHook={usePeopleSelectQuery}
          dataKey="items"
          transformData={(p: IPerson) => ({
            value: { _id: p.id },
            label: p.name,
          })}
          required
        />
        <Select
          label={`Their relationship to ${person.firstName}`}
          value={relationship}
          options={RELATIONSHIP_OPTIONS}
          onChange={setRelationship}
          required
        />
        {isOther && (
          <div>
            <label
              htmlFor="relationship-note"
              className="block text-2xs font-semibold uppercase tracking-wider text-fg-secondary mb-1.5"
            >
              Note (optional)
            </label>
            <input
              id="relationship-note"
              type="text"
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Guardian, Cousin"
              className="w-full text-xs rounded-xl border border-border-control bg-surface px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-danger-border bg-danger-soft px-3 py-2 text-xs font-medium text-danger-text"
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

function RelativeRow({
  relative,
  canManage,
  onRemove,
}: {
  relative: IRelative;
  canManage: boolean;
  onRemove: (relative: IRelative) => void;
}) {
  const label =
    relative.relationship === "OTHER" && relative.relationshipNote
      ? relative.relationshipNote
      : RELATIONSHIP_LABELS[relative.relationship];
  const name = `${relative.person.firstName} ${relative.person.lastName}`;

  return (
    <div className="p-3 rounded-xl bg-subtle border border-border space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-fg truncate">{name}</p>
          <p className="text-2xs text-fg-muted">{label}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {relative.claimed ? (
            <Badge variant="emerald" size="sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Profile claimed
            </Badge>
          ) : (
            <Badge variant="slate" size="sm">
              Not claimed
            </Badge>
          )}
          {canManage && (
            <button
              type="button"
              aria-label={`Remove link to ${name}`}
              title="Remove link"
              onClick={() => onRemove(relative)}
              className="p-1.5 rounded-lg text-fg-muted hover:text-danger-text hover:bg-danger-soft transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {(relative.maskedEmail || relative.maskedPhone) && (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-2xs text-fg-muted font-mono">
          {relative.maskedEmail && <span>{relative.maskedEmail}</span>}
          {relative.maskedPhone && <span>{relative.maskedPhone}</span>}
        </div>
      )}
      {relative.canSendClaimLink && (
        <WhatsAppButton
          personId={relative.person.id}
          purpose="PROFILE_LINK"
          label="Send Profile Link (WhatsApp)"
          size="sm"
          variant="outline"
        />
      )}
    </div>
  );
}

/** "Family & Relatives" block of the person details drawer. */
export function PersonFamilySection({ person }: { person: IPerson }) {
  const { user } = useAuth();
  const canManage = hasAuthority(getUserRoles(user), [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
  ]);

  const { data, isLoading, isError, refetch } = useRelatives(person.id);
  const removeRelative = useRemoveRelative(person.id);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<IRelative | null>(null);

  const relatives = data ?? [];

  return (
    <div className="p-3.5 rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-fg flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary-text" />
          Family &amp; Relatives ({relatives.length})
        </p>
        {canManage && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setAdding(true)}
          >
            Link
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <div className="text-center text-2xs text-fg-muted space-y-2">
          <p>Failed to load family links.</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : relatives.length === 0 ? (
        <p className="text-2xs text-fg-muted italic">
          No family links recorded.
        </p>
      ) : (
        <div className="space-y-2">
          {relatives.map((r) => (
            <RelativeRow
              key={r.relationshipId}
              relative={r}
              canManage={canManage}
              onRemove={setRemoving}
            />
          ))}
        </div>
      )}

      {adding && (
        <AddRelativeModal person={person} onClose={() => setAdding(false)} />
      )}

      {removing && (
        <ConfirmActionModal
          display
          close={() => setRemoving(null)}
          actionName="remove"
          tone="danger"
          confirmLabel="Remove link"
          title={`Remove the link to ${removing.person.firstName} ${removing.person.lastName}?`}
          description="Only the family link is removed. Neither person's record is changed."
          fn={async () => {
            await removeRelative.mutateAsync(removing.relationshipId);
          }}
        />
      )}
    </div>
  );
}
