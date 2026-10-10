"use client";

import React from "react";
import { Mail, User, Send, FileText, Hash, ShieldAlert } from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { EmailLogItem } from "@/models/emailLog";
import dayjs from "dayjs";

interface ViewEmailLogModalProps {
  log: EmailLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewEmailLogModal: React.FC<ViewEmailLogModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!log) return null;

  const sentDate = log.sentAt || log.createdAt;
  const createdAtFormatted = sentDate
    ? dayjs(sentDate).format("MMMM D, YYYY [at] h:mm A")
    : null;

  const remediatedAtFormatted = log.bounce?.remediatedAt
    ? dayjs(log.bounce.remediatedAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  return (
    <SidebarModal
      footer={
        <>
          <Button
            variant="outline"
            className="!h-10 !text-xs font-semibold"
            onClick={onClose}
          >
            Close
          </Button>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Email Log Details"
      description={
        <span className="flex items-center gap-1.5 font-mono text-xs">
          <Mail className="w-3.5 h-3.5 text-primary-text" />
          {log.recipient?.email || "No recipient email"}
        </span>
      }
    >
      <div className="space-y-5 pb-4">
        {/* Status & Timing Overview */}
        <div className="p-4 rounded-2xl bg-subtle border border-border space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-fg-muted">
                Status:
              </span>
              <StatusBadge status={log.deliveryStatus} size="sm" />
            </div>

            <Badge variant="indigo" size="sm" className="font-mono text-2xs">
              {log.emailType}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-control text-xs">
            <div>
              <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                Sent At
              </span>
              <span className="font-medium text-fg">
                {createdAtFormatted || "—"}
              </span>
            </div>
            <div>
              <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                Resend Message ID
              </span>
              <div className="font-mono text-fg-secondary truncate">
                {log.resendEmailId ? (
                  <TruncatedTextWithCopy
                    text={log.resendEmailId}
                    maxLength={20}
                  />
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Card */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-fg-subtle" /> Recipient Details
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Name:</span>
              <span className="font-semibold text-fg">
                {log.recipient?.name || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Email:</span>
              <div className="font-mono text-fg">
                {log.recipient?.email ? (
                  <TruncatedTextWithCopy
                    text={log.recipient.email}
                    maxLength={28}
                  />
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sender Info */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-fg-subtle" /> Sender Information
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2 text-xs">
            {log.sentBy ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Sender:</span>
                  <span className="font-semibold text-fg">
                    {log.sentBy.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Email:</span>
                  <span className="font-mono text-fg-secondary">
                    {log.sentBy.email}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-fg-secondary italic">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Automated / System Triggered
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-fg-subtle" /> Email Content
          </h4>
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-3 text-xs">
            <div>
              <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                Subject
              </span>
              <p className="font-semibold text-fg text-sm">
                {log.subject || log.content?.subject || "—"}
              </p>
            </div>

            {log.content?.heading && (
              <div>
                <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                  Heading
                </span>
                <p className="text-fg font-medium">{log.content.heading}</p>
              </div>
            )}

            {(log.content?.message || log.content?.bodyTextSnippet) && (
              <div>
                <span className="text-2xs uppercase font-bold text-fg-muted block mb-0.5">
                  Message Content
                </span>
                {log.content.message ? (
                  <div
                    className="p-3 rounded-lg bg-subtle border border-border-control text-fg-secondary leading-relaxed max-h-56 overflow-y-auto text-xs space-y-2"
                    dangerouslySetInnerHTML={{
                      __html: log.content.message,
                    }}
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-subtle border border-border-control text-fg-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {log.content.bodyTextSnippet}
                  </div>
                )}
              </div>
            )}

            {log.content?.ctaUrl && (
              <div className="pt-1">
                <a
                  href={log.content.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                >
                  {log.content.ctaLabel || "Open Action Link"} &rarr;
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Context IDs if any */}
        {(log.context?.personId ||
          log.context?.userId ||
          log.context?.registrationId) && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-fg-subtle" /> Associated Context
            </h4>
            <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2 text-xs">
              {log.context.personId && (
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Person ID:</span>
                  <TruncatedTextWithCopy
                    text={log.context.personId}
                    maxLength={20}
                  />
                </div>
              )}
              {log.context.registrationId && (
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">Registration ID:</span>
                  <TruncatedTextWithCopy
                    text={log.context.registrationId}
                    maxLength={20}
                  />
                </div>
              )}
              {log.context.userId && (
                <div className="flex items-center justify-between">
                  <span className="text-fg-muted">User ID:</span>
                  <TruncatedTextWithCopy
                    text={log.context.userId}
                    maxLength={20}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bounce Details (if available) */}
        {log.bounce && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-danger-text flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Bounce Classification
            </h4>
            <div className="p-3.5 rounded-xl border border-danger-border bg-danger-soft space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-danger-text">Type:</span>
                <span className="font-semibold text-danger-text">
                  {log.bounce.bounceType}
                  {log.bounce.bounceSubType
                    ? ` (${log.bounce.bounceSubType})`
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-danger-text">Resolved:</span>
                <span className="font-semibold">
                  {log.bounce.resolved ? "Yes" : "No"}
                </span>
              </div>
              {remediatedAtFormatted && (
                <div className="flex items-center justify-between">
                  <span className="text-danger-text">Remediated:</span>
                  <span>{remediatedAtFormatted}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarModal>
  );
};
