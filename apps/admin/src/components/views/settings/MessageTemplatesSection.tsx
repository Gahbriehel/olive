"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/FormElements/Input";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { MessageTemplate, OutreachPurpose } from "@/models/outreach";
import {
  useCreateMessageTemplate,
  useDeleteMessageTemplate,
  useMessageTemplates,
  usePreviewTemplateBody,
  useUpdateMessageTemplate,
} from "@/hooks/useMessageTemplates";
import { CHECK_IN_REASONS, CheckInReason } from "@/models/checkIn";
import { customToast } from "@/helpers/customToast";

interface MessageTemplatesSectionProps {
  isAdmin: boolean;
}

const PURPOSES: Array<{ id: OutreachPurpose; label: string }> = [
  { id: "BIRTHDAY", label: "Birthday Greetings" },
  { id: "VISITOR_FOLLOW_UP", label: "Visitor Follow-up" },
  { id: "PASTORAL_CHECK_IN", label: "Pastoral Check-in" },
];

const PLACEHOLDERS = [
  { token: "{{firstName}}", label: "Recipient First Name" },
  { token: "{{adminName}}", label: "Staff Display Name" },
  { token: "{{churchName}}", label: "Church Name" },
];

export const MessageTemplatesSection: React.FC<
  MessageTemplatesSectionProps
> = ({ isAdmin }) => {
  const { data: templates = [] } = useMessageTemplates({
    includeInactive: true,
  });

  const createMutation = useCreateMessageTemplate();
  const updateMutation = useUpdateMessageTemplate();
  const deleteMutation = useDeleteMessageTemplate();
  const previewMutation = usePreviewTemplateBody();

  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [formName, setFormName] = useState("");
  const [formPurpose, setFormPurpose] = useState<OutreachPurpose>("BIRTHDAY");
  const [formReason, setFormReason] = useState<string>("");
  const [formBody, setFormBody] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced preview calculation
  useEffect(() => {
    if (!isEditorOpen || !formBody.trim()) return;

    const timer = setTimeout(() => {
      previewMutation.mutate(formBody);
    }, 300);

    return () => clearTimeout(timer);
  }, [formBody, isEditorOpen, previewMutation]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormPurpose("BIRTHDAY");
    setFormReason("");
    setFormBody("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setFormName(t.name);
    setFormPurpose(t.purpose);
    setFormReason(t.checkInReason || "");
    setFormBody(t.body);
    setIsEditorOpen(true);
  };

  const handleInsertPlaceholder = (token: string) => {
    if (!textareaRef.current) {
      setFormBody((prev) => prev + token);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const next = formBody.slice(0, start) + token + formBody.slice(end);
    setFormBody(next);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + token.length,
          start + token.length,
        );
      }
    }, 0);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) {
      customToast.error("Please fill in template name and message body.");
      return;
    }

    if (formBody.length > 1000) {
      customToast.error("Message body cannot exceed 1,000 characters.");
      return;
    }

    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          payload: {
            name: formName.trim(),
            body: formBody,
            checkInReason:
              formPurpose === "PASTORAL_CHECK_IN" && formReason
                ? (formReason as CheckInReason)
                : null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          channel: "WHATSAPP",
          purpose: formPurpose,
          name: formName.trim(),
          body: formBody,
          checkInReason:
            formPurpose === "PASTORAL_CHECK_IN" && formReason
              ? (formReason as CheckInReason)
              : null,
        });
      }
      setIsEditorOpen(false);
    } catch {
      // Handled in mutations
    }
  };

  const handleToggleActive = (t: MessageTemplate) => {
    if (!isAdmin) return;
    updateMutation.mutate({
      id: t.id,
      payload: { isActive: !t.isActive },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-text" />
            Message Templates
          </CardTitle>
          <CardDescription>
            Reusable WhatsApp messages rotated for birthdays, follow-ups, and
            pastoral care
          </CardDescription>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Template
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6 text-xs">
        {/* Guidance Notice */}
        <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary-border text-foreground flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Keep two or three versions for each purpose. Dove rotates them so
            messages to different people aren&apos;t identical, which helps keep
            the church WhatsApp number in good standing.
          </p>
        </div>

        {/* Grouped by Purpose */}
        {PURPOSES.map((p) => {
          const purposeTemplates = templates.filter((t) => t.purpose === p.id);

          return (
            <div key={p.id} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>{p.label}</span>
                  <Badge variant="slate" size="sm">
                    {purposeTemplates.length}
                  </Badge>
                </h4>
              </div>

              {purposeTemplates.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground">
                  No templates configured for {p.label.toLowerCase()}.
                </div>
              ) : p.id === "PASTORAL_CHECK_IN" ? (
                /* Pastoral check-in templates grouped further by reason */
                <div className="space-y-4">
                  {/* General / Any Reason */}
                  <div className="space-y-2">
                    <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                      Any Reason (General)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {purposeTemplates
                        .filter((t) => !t.checkInReason)
                        .map((t) => (
                          <TemplateCard
                            key={t.id}
                            template={t}
                            isAdmin={isAdmin}
                            onEdit={() => handleOpenEdit(t)}
                            onDelete={() => setDeletingId(t.id)}
                            onToggleActive={() => handleToggleActive(t)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Specific Check-in Reasons */}
                  {(Object.keys(CHECK_IN_REASONS) as CheckInReason[]).map(
                    (reasonKey) => {
                      const reasonTemplates = purposeTemplates.filter(
                        (t) => t.checkInReason === reasonKey,
                      );
                      if (reasonTemplates.length === 0) return null;

                      return (
                        <div key={reasonKey} className="space-y-2">
                          <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                            {CHECK_IN_REASONS[reasonKey].label}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reasonTemplates.map((t) => (
                              <TemplateCard
                                key={t.id}
                                template={t}
                                isAdmin={isAdmin}
                                onEdit={() => handleOpenEdit(t)}
                                onDelete={() => setDeletingId(t.id)}
                                onToggleActive={() => handleToggleActive(t)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                /* Regular Purpose Templates */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {purposeTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isAdmin={isAdmin}
                      onEdit={() => handleOpenEdit(t)}
                      onDelete={() => setDeletingId(t.id)}
                      onToggleActive={() => handleToggleActive(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* Template Editor Modal */}
      {isEditorOpen && (
        <Modal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          title={
            editingTemplate ? "Edit Message Template" : "New Message Template"
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditorOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={handleSaveTemplate}
              >
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
            <Input
              label="Template Name"
              value={formName}
              placeholder="e.g. Warm Birthday Blessing v1"
              required
              onChange={(e) => setFormName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-medium text-foreground mb-1">
                  Outreach Purpose
                </label>
                <select
                  value={formPurpose}
                  disabled={Boolean(editingTemplate)}
                  onChange={(e) =>
                    setFormPurpose(e.target.value as OutreachPurpose)
                  }
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                >
                  {PURPOSES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {formPurpose === "PASTORAL_CHECK_IN" && (
                <div>
                  <label className="block text-2xs font-medium text-foreground mb-1">
                    Check-in Reason
                  </label>
                  <select
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Any reason (General)</option>
                    {(Object.keys(CHECK_IN_REASONS) as CheckInReason[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {CHECK_IN_REASONS[key].label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Placeholder chips */}
            <div>
              <label className="block text-2xs font-medium text-foreground mb-1.5">
                Insert Personalized Field
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PLACEHOLDERS.map((chip) => (
                  <button
                    key={chip.token}
                    type="button"
                    onClick={() => handleInsertPlaceholder(chip.token)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-mono bg-primary-soft text-primary-text border border-primary-border hover:bg-primary-border transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{chip.token}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-2xs font-medium text-foreground">
                  Template Body
                </label>
                <span
                  className={
                    formBody.length > 1000
                      ? "text-2xs font-mono text-danger-text font-bold"
                      : "text-2xs font-mono text-fg-muted"
                  }
                >
                  {formBody.length} / 1,000
                </span>
              </div>
              <textarea
                ref={textareaRef}
                rows={5}
                value={formBody}
                required
                maxLength={1100}
                placeholder="Write your template text. Insert placeholders like {{firstName}}..."
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full text-xs font-sans rounded-lg border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed resize-y"
              />
            </div>

            {/* Validation / Unknown placeholders error */}
            {previewMutation.data?.unknownPlaceholders &&
              previewMutation.data.unknownPlaceholders.length > 0 && (
                <div className="p-3 rounded-lg bg-danger-soft text-danger-text border border-danger-border text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-danger-text shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Unknown placeholders detected:
                    </p>
                    <p className="mt-0.5 font-mono text-2xs">
                      {previewMutation.data.unknownPlaceholders.join(", ")}
                    </p>
                    <p className="mt-1 text-2xs">
                      Allowed placeholders are:
                      &#123;&#123;firstName&#125;&#125;,
                      &#123;&#123;adminName&#125;&#125;,
                      &#123;&#123;churchName&#125;&#125;.
                    </p>
                  </div>
                </div>
              )}

            {/* Live Sample Preview */}
            {previewMutation.data?.body && (
              <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Live Render Preview
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {previewMutation.data.body}
                </p>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Delete / Deactivate Confirmation */}
      <ConfirmActionModal
        display={Boolean(deletingId)}
        close={() => setDeletingId(null)}
        fn={handleDeleteConfirm}
        title="Delete Message Template"
        description="Are you sure you want to delete this template? If this template has already been used in sent outreach messages, Dove will safely deactivate it instead of deleting it to preserve history."
        confirmLabel="Delete / Deactivate"
        tone="danger"
        loading={deleteMutation.isPending}
      />
    </Card>
  );
};

interface TemplateCardProps {
  template: MessageTemplate;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function TemplateCard({
  template,
  isAdmin,
  onEdit,
  onDelete,
  onToggleActive,
}: TemplateCardProps) {
  // Show first two lines of body
  const previewLines = template.body.split("\n").slice(0, 2).join(" ");

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 hover:border-border-control transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-xs text-foreground truncate">
            {template.name}
          </p>
          {template.checkInReason && (
            <span className="text-2xs text-muted-foreground">
              {CHECK_IN_REASONS[template.checkInReason]?.label ||
                template.checkInReason}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <button
              type="button"
              onClick={onToggleActive}
              className={
                template.isActive
                  ? "px-2 py-0.5 rounded text-2xs font-semibold bg-success-soft text-success-text border border-success-border"
                  : "px-2 py-0.5 rounded text-2xs font-medium bg-subtle text-fg-muted border border-border"
              }
              title={
                template.isActive ? "Click to deactivate" : "Click to activate"
              }
            >
              {template.isActive ? "Active" : "Inactive"}
            </button>
          ) : (
            <Badge variant={template.isActive ? "emerald" : "slate"} size="sm">
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
                title="Edit template"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1 rounded text-muted-foreground hover:text-danger-text"
                title="Delete template"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
        {previewLines}
      </p>
    </div>
  );
}

export default MessageTemplatesSection;
