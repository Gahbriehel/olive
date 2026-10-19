"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  IPerson,
  ApiMembershipStatus,
  getNextMembershipTiers,
  reverseMembershipMap,
} from "@/models/person";

interface PromotePersonModalProps {
  person: IPerson | null;
  isOpen: boolean;
  onClose: () => void;
  onPromote: (
    id: string,
    membershipStatus: ApiMembershipStatus,
  ) => Promise<void>;
  isLoading?: boolean;
}

export const PromotePersonModal: React.FC<PromotePersonModalProps> = ({
  person,
  isOpen,
  onClose,
  onPromote,
  isLoading = false,
}) => {
  const currentRawStatus: ApiMembershipStatus =
    person?.rawMembershipStatus ||
    (person?.membershipStatus
      ? reverseMembershipMap[person.membershipStatus] || "VISITOR"
      : "VISITOR");

  const eligibleTiers = getNextMembershipTiers(currentRawStatus);
  const [selectedTier, setSelectedTier] = useState<ApiMembershipStatus>(
    eligibleTiers[0] || "MEMBER",
  );

  // Profile completeness guard: Requires at least an email or phone
  const hasContactInfo = Boolean(
    (person?.email && person.email !== "N/A" && person.email.trim()) ||
    (person?.phone && person.phone !== "N/A" && person.phone.trim()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !hasContactInfo || !selectedTier) return;
    await onPromote(person.id, selectedTier);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Promote Member"
      description={
        person ? `Promote ${person.name} up the ministry hierarchy` : undefined
      }
      maxWidth="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="promote-person-form"
            variant="primary"
            size="sm"
            disabled={
              !hasContactInfo || eligibleTiers.length === 0 || isLoading
            }
            loading={isLoading}
          >
            Promote Person
          </Button>
        </>
      }
    >
      {person && (
        <form
          id="promote-person-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Current Status Box */}
          <div className="p-3.5 rounded-xl bg-subtle border border-border flex items-center justify-between">
            <div>
              <p className="text-2xs text-fg-muted uppercase font-bold tracking-wider">
                Current Tier
              </p>
              <p className="text-sm font-bold text-fg mt-0.5">{person.name}</p>
            </div>
            <StatusBadge status={person.membershipStatus} size="md" />
          </div>

          {/* Completeness Warning Guard */}
          {!hasContactInfo ? (
            <div className="p-3.5 rounded-xl bg-danger-soft border border-danger-border flex items-start gap-3 text-xs text-danger-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Missing Contact Information</p>
                <p className="mt-0.5">
                  This person must have an email address or a phone number
                  before they can be promoted. Please edit their profile first.
                </p>
              </div>
            </div>
          ) : eligibleTiers.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-primary-soft border border-primary-border flex items-start gap-3 text-xs text-primary-text">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Highest Level Achieved</p>
                <p className="mt-0.5">
                  {person.name} is already at the highest membership status (
                  {person.membershipStatus}).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-fg block">
                Select Promotion Tier:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {eligibleTiers.map((tier) => {
                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary-soft text-primary-text font-bold shadow-xs ring-1 ring-primary"
                          : "border-border bg-card hover:bg-subtle text-fg"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ArrowUpRight
                          className={`w-4 h-4 ${
                            isSelected ? "text-primary" : "text-fg-muted"
                          }`}
                        />
                        <span className="text-xs font-semibold">{tier}</span>
                      </div>
                      <StatusBadge status={tier} size="sm" />
                    </button>
                  );
                })}
              </div>

              {/* Automatic Follow-up Note */}
              <div className="p-3 rounded-xl bg-subtle border border-border flex items-start gap-2.5 text-2xs text-fg-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <p>
                  Promoting this person will automatically mark any pending
                  pastoral follow-up as{" "}
                  <strong className="text-fg">Converted</strong>.
                </p>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
