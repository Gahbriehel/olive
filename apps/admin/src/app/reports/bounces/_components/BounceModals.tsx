"use client";

import { ViewBounceDetailsModal } from "@/components/modals/ViewBounceDetailsModal";
import { RemediateBounceModal } from "@/components/modals/RemediateBounceModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { EmailBounce } from "@/models/emailBounce";

interface BounceModalsProps {
  selectedBounce: EmailBounce | null;
  setSelectedBounce: (bounce: EmailBounce | null) => void;
  resolveTarget: EmailBounce | null;
  setResolveTarget: (bounce: EmailBounce | null) => void;
  remediateTarget: EmailBounce | null;
  setRemediateTarget: (bounce: EmailBounce | null) => void;
  resolve: (id: string) => Promise<unknown>;
  isResolving: boolean;
}

/** Details panel, resolve confirmation and remediate flow for a bounce. */
export function BounceModals({
  selectedBounce,
  setSelectedBounce,
  resolveTarget,
  setResolveTarget,
  remediateTarget,
  setRemediateTarget,
  resolve,
  isResolving,
}: BounceModalsProps) {
  return (
    <>
      <ViewBounceDetailsModal
        isOpen={Boolean(selectedBounce)}
        bounce={selectedBounce}
        onClose={() => setSelectedBounce(null)}
        isResolving={isResolving}
        onRemediate={(bounce) => {
          setSelectedBounce(null);
          setRemediateTarget(bounce);
        }}
        onResolve={(bounce) => setResolveTarget(bounce)}
      />

      {/* Marking resolved always confirms first */}
      <ConfirmActionModal
        display={Boolean(resolveTarget)}
        close={() => setResolveTarget(null)}
        fn={async () => {
          if (resolveTarget) await resolve(resolveTarget.id);
        }}
        actionName="Mark resolved"
        tone="default"
        title="Mark this bounce as resolved?"
        description={
          <>
            This closes the alert for{" "}
            <span className="font-mono font-semibold text-fg">
              {resolveTarget?.email}
            </span>{" "}
            without changing the email address on file. To correct the address,
            use Fix &amp; Remediate instead.
          </>
        }
        confirmLabel="Mark resolved"
        loading={isResolving}
      />

      <RemediateBounceModal
        isOpen={Boolean(remediateTarget)}
        bounce={remediateTarget}
        onClose={() => setRemediateTarget(null)}
      />
    </>
  );
}
