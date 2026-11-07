"use client";

import React, { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import {
  CreateScripturePayload,
  SCRIPTURE_KIND_LABEL,
  Scripture,
  ScriptureKind,
} from "@/models/scripture";
import { ScriptureFormValues, scriptureSchema } from "./scriptureSchema";
import { ScripturePreview } from "./ScripturePreview";
import {
  defaultStartsOn,
  readRememberedTranslation,
  rememberTranslation,
  wouldReplaceLive,
} from "./scriptureUtils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  kind: ScriptureKind;
  /** Undefined when adding a new scripture. */
  scripture?: Scripture | null;
  /** The record currently live for this kind, for the replace warning. */
  live: Scripture | null;
  onSubmit: (payload: CreateScripturePayload) => Promise<void>;
}

const toPayload = (
  kind: ScriptureKind,
  v: ScriptureFormValues,
): CreateScripturePayload => ({
  kind,
  text: v.text.replace(/\r\n?/g, "\n").trim(),
  reference: v.reference.trim(),
  translation: v.translation?.trim() || null,
  givenBy: v.givenBy?.trim() || null,
  startsOn: v.startsOn,
  status: v.published ? "PUBLISHED" : "DRAFT",
  notifyMembers: v.notifyMembers,
});

/**
 * Add/edit form. The page mounts it only while open (keyed per record) so the
 * defaults, including the remembered translation, are computed fresh each time.
 */
export const ScriptureFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  kind,
  scripture,
  live,
  onSubmit,
}) => {
  const isEdit = Boolean(scripture);
  const label = SCRIPTURE_KIND_LABEL[kind];

  const defaults = useMemo<ScriptureFormValues>(
    () => ({
      text: scripture?.text ?? "",
      reference: scripture?.reference ?? "",
      translation: scripture
        ? (scripture.translation ?? "")
        : readRememberedTranslation(),
      givenBy: scripture?.givenBy ?? "",
      startsOn: scripture?.startsOn ?? defaultStartsOn(kind),
      published: scripture ? scripture.status === "PUBLISHED" : false,
      notifyMembers: scripture?.notifyMembers ?? true,
    }),
    [scripture, kind],
  );

  const { control, handleSubmit, formState } = useForm<ScriptureFormValues>({
    resolver: yupResolver(scriptureSchema),
    mode: "onTouched",
    defaultValues: defaults,
  });

  const [text, reference, translation, givenBy] = useWatch({
    control,
    name: ["text", "reference", "translation", "givenBy"],
  });

  const [pending, setPending] = useState<ScriptureFormValues | null>(null);

  const persist = async (values: ScriptureFormValues) => {
    await onSubmit(toPayload(kind, values));
    rememberTranslation(values.translation?.trim() ?? "");
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    if (
      wouldReplaceLive(live, {
        id: scripture?.id,
        startsOn: values.startsOn,
        status: values.published ? "PUBLISHED" : "DRAFT",
        createdAt: scripture?.createdAt,
      })
    ) {
      setPending(values);
      return;
    }
    try {
      await persist(values);
    } catch {
      // API errors are toasted by the API client; keep the form open.
    }
  });

  const formId = "scripture-form";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="2xl"
        title={`${isEdit ? "Edit" : "Add"} scripture · ${label}`}
        description="Members see this at the top of the home page."
        footerStart={
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        }
        footer={
          <Button type="submit" form={formId} loading={formState.isSubmitting}>
            {isEdit ? "Save changes" : "Add scripture"}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <form
            id={formId}
            noValidate
            onSubmit={submit}
            className="space-y-5 md:col-span-3"
          >
            <Controller
              name="text"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextArea
                  {...field}
                  label="Scripture text"
                  required
                  rows={6}
                  maxLength={1500}
                  error={error?.message}
                  hint="Plain text only. Quotation marks are added for you."
                  labelSuffix={
                    <span className="ml-auto font-mono text-2xs text-fg-muted">
                      {(text ?? "").length.toLocaleString()} / 1,500
                    </span>
                  }
                />
              )}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Controller
                name="reference"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    label="Reference"
                    required
                    placeholder="Genesis 1:1-3"
                    maxLength={100}
                    error={error?.message}
                  />
                )}
              />
              <Controller
                name="translation"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    label="Translation"
                    placeholder="NKJV"
                    maxLength={20}
                    error={error?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="givenBy"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  label="Given by"
                  placeholder="Pastor Solomon"
                  maxLength={100}
                  error={error?.message}
                  hint="Optional. The minister who gave the word."
                />
              )}
            />

            <Controller
              name="startsOn"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Input
                  {...field}
                  type="date"
                  label="Starts on"
                  required
                  error={error?.message}
                  hint="Goes live on this date (Lagos time) once published."
                />
              )}
            />

            <Controller
              name="published"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  color="emerald"
                  label={field.value ? "Published" : "Draft"}
                  description={
                    field.value
                      ? "Members see it from the start date."
                      : "Hidden from members until published."
                  }
                />
              )}
            />

            <Controller
              name="notifyMembers"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  color="indigo"
                  label="Notify members when this scripture starts"
                  description={
                    field.value
                      ? "A push notification is sent on the start date, at the scripture send time."
                      : "Saved without sending a push notification."
                  }
                />
              )}
            />
          </form>

          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold text-fg-muted">Preview</p>
            <ScripturePreview
              text={text ?? ""}
              reference={reference ?? ""}
              translation={translation}
              givenBy={givenBy}
            />
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        display={Boolean(pending)}
        close={() => setPending(null)}
        actionName="publish"
        tone="danger"
        title={`Replace the live scripture for ${label}?`}
        description={`Publishing this will immediately replace the live scripture for ${label}. Live scripture "${live?.reference ?? ""}" will no longer be current.`}
        confirmLabel="Publish and replace"
        fn={async () => {
          if (pending) await persist(pending);
        }}
      />
    </>
  );
};
