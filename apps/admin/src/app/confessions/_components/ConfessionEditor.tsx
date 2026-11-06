"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { BookOpen, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import {
  useConfessionCategories,
  useConfessionDetail,
  useCreateConfession,
  useConfessions,
} from "@/hooks/useConfessions";
import {
  ConfessionDetail,
  ConfessionStatus,
  CreateConfessionPayload,
} from "@/models/confession";
import { AudioPanel } from "./AudioPanel";
import { PhonePreview } from "./PhonePreview";
import { ConfessionFormValues, confessionSchema } from "./confessionSchema";
import { countWords, slugify } from "./confessionUtils";

interface Props {
  /** Undefined when creating a new confession. */
  confession?: ConfessionDetail;
}

const crumbs = [{ label: "Confessions", href: "/confessions" }];

const toPayload = (
  v: ConfessionFormValues,
  status?: ConfessionStatus,
): CreateConfessionPayload => ({
  title: v.title.trim(),
  slug: v.slug.trim(),
  body: v.body.replace(/\r\n?/g, "\n"),
  scriptureRef: v.scriptureRef?.trim() || null,
  category: v.category?.trim() || null,
  ...(status ? { status } : {}),
});

export const ConfessionEditor: React.FC<Props> = ({ confession }) => {
  const router = useRouter();
  const isNew = !confession;
  const id = confession?.id ?? "";

  const categories = useConfessionCategories();
  const { createConfession, isCreating } = useCreateConfession();
  const {
    updateConfession,
    isSaving,
    uploadAudio,
    uploadingVoice,
    deleteAudio,
    deletingVoice,
  } = useConfessionDetail(id);
  const { deleteConfession, isDeleting } = useConfessions();

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    getValues,
    reset,
    formState,
  } = useForm<ConfessionFormValues>({
    resolver: yupResolver(confessionSchema),
    mode: "onTouched",
    defaultValues: {
      title: confession?.title ?? "",
      slug: confession?.slug ?? "",
      scriptureRef: confession?.scriptureRef ?? "",
      category: confession?.category ?? "",
      body: confession?.body ?? "",
    },
  });

  const [title, slug, scriptureRef, category, body] = useWatch({
    control,
    name: ["title", "slug", "scriptureRef", "category", "body"],
  });

  // Auto-generate the slug from the title until the editor edits it by hand.
  const slugTouched = useRef(!isNew);

  const [pendingSlugSave, setPendingSlugSave] = useState<{
    values: ConfessionFormValues;
    status?: ConfessionStatus;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  const { isDirty } = formState;
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const slugChanged = !isNew && slug.trim() !== confession.slug;
  const wordCount = countWords(body ?? "");
  const canPublish = Boolean(title.trim() && body?.trim());
  const isPublished = confession?.status === "PUBLISHED";
  const busy = isSaving || isCreating || formState.isSubmitting;

  const persist = async (
    values: ConfessionFormValues,
    status?: ConfessionStatus,
  ) => {
    try {
      if (isNew) {
        const created = await createConfession(toPayload(values, status));
        reset(values); // not dirty any more, so navigating away doesn't prompt
        router.replace(`/confessions/${created.id}`);
      } else {
        const updated = await updateConfession(toPayload(values, status));
        reset({
          title: updated.title,
          slug: updated.slug,
          scriptureRef: updated.scriptureRef ?? "",
          category: updated.category ?? "",
          body: updated.body,
        });
        if (updated.slug !== confession.slug) {
          router.replace(`/confessions/${updated.id}`);
        }
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError("slug", {
          message:
            "This slug is already used by another confession. Choose a different one.",
        });
      }
      // Other API errors are toasted by the API client.
    }
  };

  const submit = (status?: ConfessionStatus) =>
    handleSubmit((values) => {
      if (status === "PUBLISHED" && !values.body.trim()) {
        setError("body", {
          message: "Add the confession text before publishing",
        });
        return;
      }
      if (!isNew && values.slug.trim() !== confession.slug) {
        setPendingSlugSave({ values, status });
        return;
      }
      return persist(values, status);
    });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        breadcrumbs={crumbs}
        icon={BookOpen}
        title={isNew ? "New Confession" : "Confession Editor"}
        description={
          isNew
            ? "Write the text first. Audio can be added once it is saved."
            : confession.title
        }
        actions={
          <>
            {!isNew && (
              <>
                <Badge variant={isPublished ? "emerald" : "slate"}>
                  {isPublished ? "Live" : "Draft"}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" loading={busy} onClick={submit()}>
              {isNew ? "Save draft" : "Save"}
            </Button>
            {isPublished ? (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => setConfirmUnpublish(true)}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                disabled={busy || !canPublish}
                title={
                  canPublish ? undefined : "Add a title and text to publish"
                }
                onClick={submit("PUBLISHED")}
              >
                Publish
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form
          noValidate
          onSubmit={submit()}
          className="space-y-5 lg:col-span-3"
          aria-label="Confession details"
        >
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Title"
                required
                maxLength={150}
                error={error?.message}
                onChange={(e) => {
                  field.onChange(e);
                  if (!slugTouched.current) {
                    setValue("slug", slugify(e.target.value), {
                      shouldDirty: true,
                    });
                  }
                }}
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                label="Slug"
                required
                error={error?.message}
                hint={
                  slugChanged
                    ? undefined
                    : "Used in the member app link. Lowercase letters, numbers and hyphens."
                }
                onChange={(e) => {
                  slugTouched.current = true;
                  field.onChange(e);
                }}
              />
            )}
          />
          {slugChanged && (
            <p
              role="status"
              className="-mt-3 flex items-start gap-1.5 text-xs text-warning-text"
            >
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Changing the slug will break existing bookmarks and shared links
              in the member app.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Controller
              name="scriptureRef"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  label="Scripture Reference"
                  placeholder="Psalm 118:24"
                  maxLength={100}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    label="Category"
                    placeholder="Choose or type a new one"
                    maxLength={50}
                    list="confession-categories"
                    error={error?.message}
                  />
                  <datalist id="confession-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            />
          </div>

          <Controller
            name="body"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextArea
                {...field}
                value={field.value ?? ""}
                label="Body (plain text)"
                rows={14}
                error={error?.message}
                labelSuffix={
                  <span className="ml-auto font-mono text-2xs text-fg-muted">
                    {wordCount.toLocaleString()} words ·{" "}
                    {(body ?? "").length.toLocaleString()} chars
                  </span>
                }
                hint="Blank lines separate paragraphs. Symbols and markdown are read literally by text-to-speech."
              />
            )}
          />

          {/* Enter in a text input submits through this hidden button. */}
          <button type="submit" hidden aria-hidden tabIndex={-1} />
        </form>

        <div className="space-y-6 lg:col-span-2">
          <PhonePreview
            title={title}
            category={category}
            scriptureRef={scriptureRef}
            body={body ?? ""}
          />
          {confession ? (
            <AudioPanel
              confession={confession}
              uploadingVoice={uploadingVoice}
              deletingVoice={deletingVoice}
              onUpload={(voice, file) => uploadAudio({ voice, file })}
              onRemove={(voice) => deleteAudio(voice).catch(() => {})}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-fg-muted">
              Save this confession to upload Female and Male audio.
            </p>
          )}
        </div>
      </div>

      <ConfirmActionModal
        display={Boolean(pendingSlugSave)}
        close={() => setPendingSlugSave(null)}
        actionName="save"
        tone="danger"
        title="Change the slug?"
        description="Changing the slug will break existing bookmarks and shared links in the member app."
        confirmLabel="Change slug and save"
        fn={async () => {
          if (pendingSlugSave) {
            await persist(pendingSlugSave.values, pendingSlugSave.status);
          }
        }}
      />

      <ConfirmActionModal
        display={confirmUnpublish}
        close={() => setConfirmUnpublish(false)}
        actionName="unpublish"
        title="Unpublish this confession?"
        description="It will disappear from the member app and keep its place as a draft."
        confirmLabel="Unpublish"
        fn={async () => {
          await persist(getValues(), "DRAFT");
        }}
      />

      <ConfirmActionModal
        display={confirmDelete}
        close={() => setConfirmDelete(false)}
        title={`Delete "${confession?.title ?? ""}"?`}
        description="This permanently removes the confession and its audio files. This cannot be undone."
        confirmLabel="Delete Confession"
        tone="danger"
        loading={isDeleting}
        fn={async () => {
          await deleteConfession(id);
          reset(getValues());
          router.replace("/confessions");
        }}
      />
    </div>
  );
};
