"use client";

import type { ChangeEvent, FormEventHandler, ReactNode } from "react";
import { useController, type Control, type FieldValues } from "react-hook-form";
import { Image as ImageIcon, Sparkles, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Switch } from "@/components/FormElements/Switch";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadFlyer } from "@/hooks/useUploads";

/**
 * Content fields EmailComposer binds to. Callers' form values use these names
 * (validated by the fragments in ./emailFields) plus their own recipient fields.
 */
export interface EmailContentValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  includeQrPass: boolean;
}

/** The fields every composer has (no image or QR pass). */
export type EmailBaseValues = Pick<
  EmailContentValues,
  "subject" | "heading" | "message" | "ctaLabel" | "ctaUrl"
>;

type ContentControl = Control<EmailContentValues>;

export type EmailPlaceholders = Partial<
  Record<
    "subject" | "heading" | "message" | "imageUrl" | "ctaLabel" | "ctaUrl",
    string
  >
>;

export interface EmailComposerProps<T extends FieldValues> {
  /** The caller's react-hook-form control. */
  control: Control<T>;
  /** The caller's `handleSubmit(...)` result. */
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Form id, for a submit button outside the form (overlay footer). */
  formId?: string;
  /** Caller-specific recipient picker or summary, shown first. */
  recipients?: ReactNode;
  /** Optional notice shown under the recipients. */
  notice?: ReactNode;
  /** Context-specific input placeholders. */
  placeholders?: EmailPlaceholders;
  /** Heading is required unless set to false. */
  headingRequired?: boolean;
  /** Merge tags offered as chips that append to the subject. */
  placeholderTags?: string[];
  /** Shows the image URL field; `upload` adds file upload and a preview. */
  image?: { label: string; upload?: boolean };
  /** Shows the "Include QR Check-In Pass" toggle. */
  qrPass?: boolean;
  /** Rendered at the end of the form (e.g. FormFooter). */
  footer?: ReactNode;
}

/**
 * Shared email form: recipients slot, subject, heading, rich-text message,
 * optional image, optional QR pass toggle and the CTA button pair. Callers
 * own the form state, schema, recipients, submit/confirm flow and footer.
 */
export function EmailComposer<T extends FieldValues>({
  control,
  onSubmit,
  formId,
  recipients,
  notice,
  placeholders = {},
  headingRequired = true,
  placeholderTags,
  image,
  qrPass,
  footer,
}: EmailComposerProps<T>) {
  // The caller's values extend EmailContentValues by contract.
  const c = control as unknown as ContentControl;

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      {recipients}
      {notice}

      <SubjectField
        control={c}
        placeholder={placeholders.subject}
        tags={placeholderTags}
      />

      <TextField
        control={c}
        name="heading"
        label={headingRequired ? "Email Heading" : "Email Heading (Optional)"}
        placeholder={placeholders.heading}
        required={headingRequired}
      />

      <MessageField control={c} placeholder={placeholders.message} />

      {image && (
        <ImageField
          control={c}
          label={image.label}
          upload={image.upload}
          placeholder={placeholders.imageUrl}
        />
      )}

      {qrPass && <QrPassField control={c} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
        <TextField
          control={c}
          name="ctaLabel"
          label="CTA Button Label (Optional)"
          placeholder={placeholders.ctaLabel}
        />
        <TextField
          control={c}
          name="ctaUrl"
          label="CTA Button URL (Optional)"
          placeholder={placeholders.ctaUrl ?? "https://..."}
        />
      </div>

      {footer}
    </form>
  );
}

function TextField({
  control,
  name,
  label,
  placeholder,
  required,
}: {
  control: ContentControl;
  name: "heading" | "ctaLabel" | "ctaUrl";
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Input
      {...field}
      label={label}
      placeholder={placeholder}
      error={fieldState.error?.message}
      required={required}
    />
  );
}

function SubjectField({
  control,
  placeholder,
  tags,
}: {
  control: ContentControl;
  placeholder?: string;
  tags?: string[];
}) {
  const { field, fieldState } = useController({ control, name: "subject" });

  const input = (
    <Input
      {...field}
      label="Email Subject"
      placeholder={placeholder}
      error={fieldState.error?.message}
      required
    />
  );
  if (!tags?.length) return input;

  return (
    <div className="flex flex-col gap-1.5">
      {input}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-2xs text-fg-muted flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary-text" />
          Placeholders:
        </span>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              field.onChange(field.value ? `${field.value} ${tag}` : tag)
            }
            className="text-2xs font-mono px-2 py-0.5 rounded-md bg-muted text-primary-text hover:bg-primary-soft transition-colors cursor-pointer"
            title={`Click to append ${tag} to subject`}
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageField({
  control,
  placeholder,
}: {
  control: ContentControl;
  placeholder?: string;
}) {
  const { field, fieldState } = useController({ control, name: "message" });
  return (
    <RichTextEditor
      {...field}
      label="Message Body"
      placeholder={placeholder}
      error={fieldState.error?.message}
      required
    />
  );
}

function ImageField({
  control,
  label,
  upload,
  placeholder,
}: {
  control: ContentControl;
  label: string;
  upload?: boolean;
  placeholder?: string;
}) {
  const { field, fieldState } = useController({ control, name: "imageUrl" });
  const { uploadFlyer, isUploadingFlyer } = useUploadFlyer();

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      field.onChange(await uploadFlyer(file));
    } catch {
      // The API client interceptor already toasted the error.
    }
  };

  return (
    <div className="flex flex-col gap-2 pt-1 border-t border-border-subtle">
      <Input
        {...field}
        label={`${label} (Optional)`}
        placeholder={placeholder}
        hint={upload ? "Max 3MB (JPEG, PNG, WEBP)" : undefined}
        icon={<ImageIcon className="w-4 h-4 text-fg-subtle" />}
        error={fieldState.error?.message}
      />

      {upload && (
        <>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted-strong cursor-pointer text-xs font-semibold text-fg-secondary transition-colors">
              {isUploadingFlyer ? (
                <Spinner size="sm" />
              ) : (
                <Upload className="w-4 h-4 text-primary-text" />
              )}
              <span>
                {isUploadingFlyer ? "Uploading..." : "Upload Image File"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleUpload}
                disabled={isUploadingFlyer}
                className="hidden"
              />
            </label>
          </div>

          {field.value && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-control bg-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={field.value}
                alt="Image preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => field.onChange("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QrPassField({ control }: { control: ContentControl }) {
  const { field } = useController({ control, name: "includeQrPass" });
  return (
    <Switch
      checked={field.value}
      onChange={field.onChange}
      label="Include QR Check-In Pass"
      description="Attaches attendee's unique QR pass and event summary card in the email"
      color="indigo"
    />
  );
}
