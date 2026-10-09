"use client";

import React from "react";
import { Mail, User, Send, FileText, Hash, ShieldAlert } from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { BaseButton } from "@/components/ui/Button";
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
  if (!log || !isOpen) return null;

  const createdAtFormatted = log.createdAt
    ? dayjs(log.createdAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  const remediatedAtFormatted = log.bounce?.remediatedAt
    ? dayjs(log.bounce.remediatedAt).format("MMMM D, YYYY [at] h:mm A")
    : null;

  return (
    <SidebarModal
      display={isOpen}
      close={onClose}
      title="Email Log Details"
      subtitle={
        <span className="flex items-center gap-1.5 font-mono text-xs">
          <Mail className="w-3.5 h-3.5 text-indigo-500" />
          {log.recipient?.email || "No recipient email"}
        </span>
      }
    >
      <div className="space-y-5 pb-4">
        {/* Status & Timing Overview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status:
              </span>
              <StatusBadge status={log.deliveryStatus} size="sm" />
            </div>

            <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
              {log.emailType}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Sent At
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {createdAtFormatted || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Resend Message ID
              </span>
              <div className="font-mono text-slate-700 dark:text-slate-300 truncate">
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" /> Recipient Details
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Name:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {log.recipient?.name || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Email:</span>
              <div className="font-mono text-slate-900 dark:text-slate-100">
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-slate-500" /> Sender Information
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
            {log.sentBy ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Sender:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.sentBy.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Email:
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {log.sentBy.email}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 italic">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Automated / System Triggered
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Email Content
          </h4>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Subject
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {log.content?.subject || "—"}
              </p>
            </div>

            {log.content?.heading && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Heading
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {log.content.heading}
                </p>
              </div>
            )}

            {log.content?.bodyTextSnippet && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Message Body Preview
                </span>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {log.content.bodyTextSnippet}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Context IDs if any */}
        {(log.context?.personId ||
          log.context?.userId ||
          log.context?.registrationId) && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" /> Associated Context
            </h4>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
              {log.context.personId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Person ID:
                  </span>
                  <TruncatedTextWithCopy
                    text={log.context.personId}
                    maxLength={20}
                  />
                </div>
              )}
              {log.context.registrationId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Registration ID:
                  </span>
                  <TruncatedTextWithCopy
                    text={log.context.registrationId}
                    maxLength={20}
                  />
                </div>
              )}
              {log.context.userId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    User ID:
                  </span>
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Bounce Classification
            </h4>
            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-rose-700 dark:text-rose-300">Type:</span>
                <span className="font-semibold text-rose-900 dark:text-rose-100">
                  {log.bounce.bounceType}
                  {log.bounce.bounceSubType
                    ? ` (${log.bounce.bounceSubType})`
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-700 dark:text-rose-300">
                  Resolved:
                </span>
                <span className="font-semibold">
                  {log.bounce.resolved ? "Yes" : "No"}
                </span>
              </div>
              {remediatedAtFormatted && (
                <div className="flex items-center justify-between">
                  <span className="text-rose-700 dark:text-rose-300">
                    Remediated:
                  </span>
                  <span>{remediatedAtFormatted}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
          <BaseButton
            text="Close"
            color="outline"
            className="!h-10 !text-xs font-semibold"
            onClick={onClose}
          />
        </div>
      </div>
    </SidebarModal>
  );
};
