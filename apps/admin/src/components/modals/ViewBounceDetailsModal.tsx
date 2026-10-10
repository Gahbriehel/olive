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
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
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
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Action Required
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Event Webhook
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                {bounce.eventType || "email.bounced"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Bounce Category
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bounce.bounceType || "Hard"}
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Details & Entity Binding */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Recipient & Message Context
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Recipient Email:
              </span>
              <div className="font-mono text-slate-900 dark:text-slate-100">
                <TruncatedTextWithCopy text={bounce.email} maxLength={28} />
              </div>
            </div>

            {bounce.recipientType && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Recipient Type:
                </span>
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
                <span className="text-slate-500 dark:text-slate-400">
                  Email Category:
                </span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                  {bounce.emailType}
                </span>
              </div>
            )}

            {bounce.registrationId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Registration ID:
                </span>
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  {bounce.registrationId}
                </span>
              </div>
            )}

            {bounce.resendEmailId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Provider Message ID:
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {bounce.resendEmailId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Server Reason */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> SMTP Diagnostic Reason
          </h4>
          <div className="p-3.5 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-2">
            <p className="font-mono text-xs text-rose-900 dark:text-rose-200 break-words leading-relaxed whitespace-pre-wrap">
              {bounce.reason ||
                "No diagnostic code returned by the destination mail server."}
            </p>
          </div>
        </div>

        {/* Timestamps & Audit Log */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Audit & Timestamps
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Recorded At:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {createdAtFormatted || "—"}
              </span>
            </div>

            {bounce.isResolved && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                  Resolved At:
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
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
