"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import {
  OutreachMessage,
  OutreachPurpose,
  OutreachWarning,
} from "@/models/outreach";
import {
  useConfirmOutreach,
  useOpenOutreach,
  useOutreachPreview,
} from "@/hooks/useOutreach";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import {
  buildWhatsAppUrl,
  detectWhatsAppTarget,
  getStoredWhatsAppTargetPref,
  WhatsAppTarget,
} from "@/utils/whatsapp";
import { customToast } from "@/helpers/customToast";

export interface WhatsAppComposeModalProps {
  open: boolean;
  onClose: () => void;
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  onConfirmedSent?: (message: OutreachMessage) => void;
  onSendEmailInstead?: () => void;
  onEditPerson?: () => void;
}

export const WhatsAppComposeModal: React.FC<WhatsAppComposeModalProps> = ({
  open,
  onClose,
  personId,
  purpose,
  checkInId,
  onConfirmedSent,
  onSendEmailInstead,
  onEditPerson,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { settings } = useSettings();
  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);

  const [step, setStep] = useState<"review" | "confirm">("review");
  const [target, setTarget] = useState<WhatsAppTarget>("web");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [initialBody, setInitialBody] = useState<string>("");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  );
  const [showReplaceEditsConfirm, setShowReplaceEditsConfirm] = useState(false);

  // Outreach mutations
  const previewMutation = useOutreachPreview();
  const openMutation = useOpenOutreach();
  const confirmMutation = useConfirmOutreach();

  const preview = previewMutation.data;
  const openedRecord = openMutation.data;
  const { mutate: mutatePreview } = previewMutation;
  const { reset: resetOpenMutation } = openMutation;

  // Church short name
  const churchShortName =
    settings?.shortName ||
    settings?.churchName ||
    user?.churchName ||
    user?.church?.name ||
    "Abiding Word Of Grace Missions";

  // Initialise target preference and preview when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("review");
      setSelectedTemplateId("");
      setBody("");
      setInitialBody("");
      setPendingTemplateId(null);
      setShowReplaceEditsConfirm(false);
      resetOpenMutation();

      const pref = getStoredWhatsAppTargetPref();
      setTarget(detectWhatsAppTarget(pref));

      mutatePreview(
        { personId, purpose, checkInId },
        {
          onSuccess: (data) => {
            setBody(data.body || "");
            setInitialBody(data.body || "");
            if (data.template?.id) {
              setSelectedTemplateId(data.template.id);
            }
          },
        },
      );
    }
  }, [open, personId, purpose, checkInId, mutatePreview, resetOpenMutation]);

  // Handle template selection change
  const handleSelectTemplate = (templateId: string) => {
    if (templateId === selectedTemplateId) return;

    if (body !== initialBody) {
      // User has custom edits, ask before replacing
      setPendingTemplateId(templateId);
      setShowReplaceEditsConfirm(true);
    } else {
      applyTemplateChange(templateId);
    }
  };

  const applyTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowReplaceEditsConfirm(false);
    setPendingTemplateId(null);

    previewMutation.mutate(
      {
        personId,
        purpose,
        checkInId,
        templateId: templateId || undefined,
      },
      {
        onSuccess: (data) => {
          setBody(data.body || "");
          setInitialBody(data.body || "");
        },
      },
    );
  };

  // Warnings analysis
  const warnings: OutreachWarning[] = preview?.warnings || [];
  const blockingWarnings = warnings.filter((w) =>
    ["NO_PHONE", "INVALID_PHONE", "WHATSAPP_OPT_OUT", "NO_TEMPLATE"].includes(
      w,
    ),
  );
  const hasBlockingWarning = blockingWarnings.length > 0;

  const isProfileLink = purpose === "PROFILE_LINK";
  // The server swaps the placeholder for the live single-use link on send.
  const PROFILE_LINK_PLACEHOLDER = "[profile link]";

  const canOpen =
    !previewMutation.isPending &&
    (!isProfileLink || body.includes(PROFILE_LINK_PLACEHOLDER)) &&
    !hasBlockingWarning &&
    body.trim().length > 0 &&
    body.length <= 1000 &&
    Boolean(preview?.whatsappDigits);

  const whatsappUrl =
    preview?.whatsappDigits && body
      ? buildWhatsAppUrl(preview.whatsappDigits, body, target)
      : "#";

  const handleOpenClick = () => {
    if (!canOpen) return;

    const payload = {
      personId,
      purpose,
      checkInId,
      templateId: selectedTemplateId || preview?.template?.id,
      body,
    };

    if (isProfileLink) {
      // The claim URL only exists once Dove has issued the token, so the
      // record must be created first and its whatsappUrl opened afterwards.
      openMutation.mutate(payload, {
        onSuccess: (record) => {
          if (record.whatsappUrl) {
            window.open(record.whatsappUrl, "_blank", "noopener,noreferrer");
          }
          queryClient.invalidateQueries({ queryKey: ["person", personId] });
          setStep("confirm");
        },
        // ALREADY_CLAIMED and other API errors are toasted by the API client;
        // stay on the review step so nothing looks sent.
        onError: (err) => {
          if (
            (err as { response?: { data?: { code?: string } } })?.response?.data
              ?.code === "ALREADY_CLAIMED"
          ) {
            queryClient.invalidateQueries({ queryKey: ["person", personId] });
            queryClient.invalidateQueries({ queryKey: ["people"] });
          }
        },
      });
      return;
    }

    // Log the open in Dove
    openMutation.mutate(payload);

    // Advance to confirmation step
    setStep("confirm");
  };

  const handleConfirmSent = (sent: boolean) => {
    if (!openedRecord?.id) {
      // If open-log failed or is still resolving, retry or close
      if (!sent) {
        onClose();
        return;
      }
      customToast.error(
        "Could not confirm because the message record was not saved yet.",
      );
      return;
    }

    confirmMutation.mutate(
      { id: openedRecord.id, sent, personId },
      {
        onSuccess: (data) => {
          if (sent) {
            customToast.success("Marked as sent");
            onConfirmedSent?.(data);
          }
          onClose();
        },
      },
    );
  };

  // Render modal content
  const recipientName = preview?.person
    ? `${preview.person.firstName} ${preview.person.lastName}`
    : "Recipient";

  const recipientPhone =
    preview?.toPhone ||
    (preview?.whatsappDigits ? `+${preview.whatsappDigits}` : "No phone");

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        step === "review"
          ? "Compose WhatsApp Message"
          : `Did you send the message to ${preview?.person?.firstName || "recipient"}?`
      }
      maxWidth="lg"
      footerStart={
        step === "review" ? (
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <a
            href={
              isProfileLink ? (openedRecord?.whatsappUrl ?? "#") : whatsappUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-fg-muted hover:text-fg inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open WhatsApp again
          </a>
        )
      }
      footer={
        step === "review" ? (
          <a
            href={canOpen && !isProfileLink ? whatsappUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!canOpen}
            onClick={(e) => {
              if (!canOpen || isProfileLink) e.preventDefault();
              if (!canOpen || openMutation.isPending) return;
              handleOpenClick();
            }}
            className={clsx(
              "relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-xl border font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] h-10 gap-2 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              canOpen
                ? "bg-primary border-transparent text-white hover:bg-primary-hover shadow-xs cursor-pointer"
                : "bg-muted border-transparent text-fg-subtle cursor-not-allowed pointer-events-none",
            )}
          >
            <WhatsAppIcon className="w-4 h-4 mr-1 text-white" />
            Open WhatsApp
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={confirmMutation.isPending}
              onClick={() => handleConfirmSent(false)}
            >
              No, I didn&apos;t send it
            </Button>
            <Button
              variant="primary"
              type="button"
              disabled={confirmMutation.isPending || !openedRecord?.id}
              loading={confirmMutation.isPending}
              onClick={() => handleConfirmSent(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Yes, I sent it
            </Button>
          </div>
        )
      }
    >
      {step === "review" ? (
        <div className="space-y-4">
          {previewMutation.isPending ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : previewMutation.isError ? (
            <div className="p-4 rounded-xl bg-danger-soft text-danger-text border border-danger-border text-sm flex items-start gap-2.5">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger-text" />
              <div>
                <p className="font-semibold">Failed to prepare preview</p>
                <p className="mt-1 text-xs">
                  {(
                    previewMutation.error as unknown as {
                      response?: { data?: { message?: string } };
                      message?: string;
                    }
                  )?.response?.data?.message ||
                    (previewMutation.error as Error)?.message ||
                    "An error occurred while generating message preview."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    previewMutation.mutate({
                      personId,
                      purpose,
                      checkInId,
                      templateId: selectedTemplateId || undefined,
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Recipient info & Last outreach */}
              <div className="p-3 bg-subtle rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-2xs text-fg-muted uppercase tracking-wider font-bold">
                    Recipient
                  </span>
                  <div className="text-sm font-semibold text-fg flex items-center gap-2 mt-0.5">
                    <span>{recipientName}</span>
                    <span className="text-xs font-normal text-fg-muted font-mono">
                      {recipientPhone}
                    </span>
                  </div>
                </div>

                {preview?.lastOutreach && (
                  <div className="text-2xs text-fg-muted sm:text-right">
                    <span>
                      Last contacted{" "}
                      {new Date(preview.lastOutreach.at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}{" "}
                      by {preview.lastOutreach.by} (
                      {preview.lastOutreach.purpose
                        .toLowerCase()
                        .replace(/_/g, " ")}
                      )
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Banners */}
              {warnings.map((w) => {
                if (w === "NO_PHONE" || w === "INVALID_PHONE") {
                  return (
                    <div
                      key={w}
                      className="p-3 rounded-xl bg-danger-soft text-danger-text border border-danger-border text-xs flex items-start gap-2.5"
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger-text" />
                      <div className="flex-1">
                        <p className="font-medium">
                          No valid phone number for {preview?.person?.firstName}
                          .
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          {onEditPerson ? (
                            <button
                              type="button"
                              onClick={onEditPerson}
                              className="font-semibold underline hover:no-underline"
                            >
                              Edit person
                            </button>
                          ) : (
                            <Link
                              href={`/people?edit=${personId}`}
                              className="font-semibold underline hover:no-underline"
                            >
                              Edit person
                            </Link>
                          )}
                          {purpose === "BIRTHDAY" && onSendEmailInstead && (
                            <button
                              type="button"
                              onClick={onSendEmailInstead}
                              className="font-semibold underline hover:no-underline text-primary"
                            >
                              Send email instead
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (w === "WHATSAPP_OPT_OUT") {
                  return (
                    <div
                      key={w}
                      className="p-3 rounded-xl bg-danger-soft text-danger-text border border-danger-border text-xs flex items-start gap-2.5"
                    >
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger-text" />
                      <div>
                        <p className="font-medium">
                          {preview?.person?.firstName} asked not to be messaged
                          on WhatsApp.
                        </p>
                      </div>
                    </div>
                  );
                }

                if (w === "NO_TEMPLATE") {
                  return (
                    <div
                      key={w}
                      className="p-3 rounded-xl bg-warning-soft text-warning-text border border-warning-border text-xs flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning-text" />
                      <div className="flex-1">
                        <p className="font-medium">
                          No active message template found for this outreach.
                        </p>
                        {isAdmin && (
                          <Link
                            href="/settings?tab=message-templates"
                            className="mt-1 inline-block font-semibold underline hover:no-underline"
                          >
                            Go to Settings → Message Templates
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                }

                if (w === "ALREADY_GREETED_THIS_YEAR") {
                  return (
                    <div
                      key={w}
                      className="p-3 rounded-xl bg-warning-soft text-warning-text border border-warning-border text-xs flex items-start gap-2.5"
                    >
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning-text" />
                      <div>
                        <p>
                          {preview?.person?.firstName} already received a
                          WhatsApp birthday message this year.
                        </p>
                      </div>
                    </div>
                  );
                }

                if (w === "CONTACTED_RECENTLY") {
                  return (
                    <div
                      key={w}
                      className="p-3 rounded-xl bg-info-soft text-info-text border border-info-border text-xs flex items-start gap-2.5"
                    >
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-info-text" />
                      <div>
                        <p>
                          {preview?.person?.firstName} was contacted in the last
                          3 days.
                        </p>
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {/* Template Picker */}
              {(preview?.template ||
                (preview?.alternatives && preview.alternatives.length > 0)) && (
                <div>
                  <label
                    htmlFor="template-select"
                    className="block text-2xs font-semibold uppercase tracking-wider text-fg-secondary mb-1.5"
                  >
                    Template
                  </label>
                  <select
                    id="template-select"
                    value={selectedTemplateId || preview?.template?.id || ""}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border-control bg-surface px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {preview?.template && (
                      <option value={preview.template.id}>
                        {preview.template.name} (Recommended)
                      </option>
                    )}
                    {preview?.alternatives?.map((alt) => (
                      <option key={alt.id} value={alt.id}>
                        {alt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Replace edits confirmation prompt */}
              {showReplaceEditsConfirm && (
                <div className="p-3.5 rounded-xl bg-warning-soft border border-warning-border text-xs flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-warning-text">
                      Replace your edits?
                    </p>
                    <p className="text-warning-text/90 mt-0.5">
                      Changing the template will overwrite your custom message
                      text.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowReplaceEditsConfirm(false);
                        setPendingTemplateId(null);
                      }}
                    >
                      Keep edits
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      type="button"
                      onClick={() => {
                        if (pendingTemplateId) {
                          applyTemplateChange(pendingTemplateId);
                        }
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              )}

              {/* Editable Message Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="outreach-message-body"
                    className="text-2xs font-semibold uppercase tracking-wider text-fg-secondary"
                  >
                    Message
                  </label>
                  <div className="flex items-center gap-3">
                    {body !== initialBody && (
                      <button
                        type="button"
                        onClick={() => setBody(initialBody)}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset to template
                      </button>
                    )}
                    <span
                      className={clsx(
                        "text-xs font-mono",
                        body.length > 1000
                          ? "text-danger-text font-bold"
                          : "text-fg-muted",
                      )}
                    >
                      {body.length} / 1,000
                    </span>
                  </div>
                </div>

                <textarea
                  id="outreach-message-body"
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here..."
                  maxLength={1200}
                  className="w-full text-xs font-sans rounded-xl border border-border-control bg-surface p-3 text-fg focus:outline-none focus:ring-2 focus:ring-primary/50 leading-relaxed resize-y"
                />
              </div>

              {/* Sending As Note */}
              <div
                className={clsx(
                  "p-3 rounded-xl text-xs leading-normal",
                  target === "universal"
                    ? "bg-warning-soft border border-warning-border text-warning-text"
                    : "bg-subtle border border-border text-fg-muted",
                )}
              >
                {target === "universal" ? (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning-text flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-warning-text">
                        Check your WhatsApp account before sending
                      </p>
                      <p className="mt-0.5">
                        If you have more than one WhatsApp on this phone, check
                        you&apos;re in the <strong>{churchShortName}</strong>{" "}
                        account before sending.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>
                    Make sure you&apos;re sending from{" "}
                    <strong className="text-fg">{churchShortName}</strong>
                    &apos;s WhatsApp.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Step 2: Confirm */
        <div className="space-y-4 py-2">
          <div className="p-6 rounded-2xl bg-subtle border border-border-subtle text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-success-soft text-success-text flex items-center justify-center mx-auto">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-fg">
              Did you send the message to{" "}
              {preview?.person?.firstName || "the recipient"}?
            </h3>
            <p className="text-xs text-fg-muted max-w-sm mx-auto">
              WhatsApp was opened with your message. If you tapped send in
              WhatsApp, mark it as sent so your team has an accurate record.
            </p>
          </div>

          {openMutation.isError && (
            <div className="p-3 rounded-xl bg-warning-soft border border-warning-border text-xs text-warning-text flex items-center justify-between">
              <span>Could not record message open.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openMutation.mutate({
                    personId,
                    purpose,
                    checkInId,
                    templateId: selectedTemplateId || preview?.template?.id,
                    body,
                  })
                }
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default WhatsAppComposeModal;
