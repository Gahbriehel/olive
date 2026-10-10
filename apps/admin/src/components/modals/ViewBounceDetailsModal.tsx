"use client";

import {
  Mail,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  Terminal,
  Wrench,
} from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { EmailBounce } from "@/models/emailBounce";
import dayjs from "dayjs";

interface ViewBounceDetailsModalProps {
  bounce: EmailBounce | null;
  isOpen: boolean;
  onClose: () => void;
  onRemediate?: (bounce: EmailBounce) => void;
  onResolve?: (bounce: EmailBounce) => void;
  isResolving?: boolean;
}

export const ViewBounceDetailsModal: React.FC<ViewBounceDetailsModalProps> = ({
  bounce,
  isOpen,
  onClose,
  onRemediate,
  onResolve,
  isResolving = false,
}) => {
  if (!bounce) return null;

  const createdAtFormatted = bounce.createdAt
    ? dayjs(bounce.createdAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  const resolvedAtFormatted = bounce.resolvedAt
    ? dayjs(bounce.resolvedAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  const isHardBounce =
    bounce.bounceType?.toLowerCase().includes("hard") ||
    bounce.bounceType?.toLowerCase().includes("permanent") ||
    bounce.eventType?.toLowerCase().includes("failed");

  return (
    <SidebarModal
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="sm:mr-auto">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {!bounce.isResolved && onResolve && (
              <Button
                variant="outline"
                loading={isResolving}
                onClick={() => onResolve(bounce)}
                leftIcon={
                  <CheckCircle2 className="w-4 h-4 text-success-text" />
                }
              >
                Mark Resolved
              </Button>
            )}

            {!bounce.isResolved && onRemediate && (
              <Button
                variant="primary"
                onClick={() => onRemediate(bounce)}
                leftIcon={<Wrench className="w-4 h-4" />}
              >
                Fix & Remediate
              </Button>
            )}
          </div>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Bounce & Delivery Diagnostics"
      description={
        <span className="flex items-center gap-1.5 font-mono">
          <Mail className="w-3.5 h-3.5" />
          {bounce.email}
        </span>
      }
    >
      <div className="space-y-6">
        {/* Top Status Card */}
        <div className="p-4 rounded-2xl bg-subtle border border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-fg-muted">
                Classification:
              </span>
              <StatusBadge
                status={
                  isHardBounce
                    ? "BOUNCED"
                    : bounce.bounceType || bounce.eventType || "BOUNCED"
                }
                size="sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {bounce.isResolved ? (
                <span className="inline-flex items-center gap-1 text-2xs font-semibold text-success-text bg-success-soft border border-success-border px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-2xs font-semibold text-warning-text bg-warning-soft border border-warning-border px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Action Required
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-control text-xs">
            <div>
              <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                Event Webhook
              </span>
              <span className="font-semibold text-fg font-mono text-2xs">
                {bounce.eventType || "email.bounced"}
              </span>
            </div>
            <div>
              <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                Bounce Category
              </span>
              <span className="font-semibold text-fg">
                {bounce.bounceType || "Hard"}
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Details & Entity Binding */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Recipient & Message Context
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Recipient Email:</span>
              <div className="font-mono text-fg">
                <TruncatedTextWithCopy text={bounce.email} maxLength={28} />
              </div>
            </div>

            {bounce.recipientType && (
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Recipient Type:</span>
                <Badge
                  variant={
                    bounce.recipientType === "PERSON" ? "indigo" : "cyan"
                  }
                  size="sm"
                >
                  {bounce.recipientType}
                </Badge>
              </div>
            )}

            {bounce.emailType && (
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Email Category:</span>
                <span className="font-mono text-2xs text-fg font-medium">
                  {bounce.emailType}
                </span>
              </div>
            )}

            {bounce.registrationId && (
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Registration ID:</span>
                <span className="font-mono text-2xs text-primary-text">
                  {bounce.registrationId}
                </span>
              </div>
            )}

            {bounce.resendEmailId && (
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Provider Message ID:</span>
                <span className="font-mono text-2xs text-fg-muted truncate max-w-[200px]">
                  {bounce.resendEmailId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Server Reason */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> SMTP Diagnostic Reason
          </h4>
          <div className="p-3.5 rounded-xl border border-danger-border bg-danger-soft text-xs space-y-2">
            <p className="font-mono text-xs text-danger-text break-words leading-relaxed whitespace-pre-wrap">
              {bounce.reason ||
                "No diagnostic code returned by the destination mail server."}
            </p>
          </div>
        </div>

        {/* Timestamps & Audit Log */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Audit & Timestamps
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-fg-subtle" /> Recorded At:
              </span>
              <span className="font-medium text-fg">
                {createdAtFormatted || "—"}
              </span>
            </div>

            {bounce.isResolved && (
              <div className="flex items-center justify-between">
                <span className="text-fg-muted flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-text" />{" "}
                  Resolved At:
                </span>
                <span className="font-medium text-fg">
                  {resolvedAtFormatted || "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarModal>
  );
};
