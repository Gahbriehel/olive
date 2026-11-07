"use client";

import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/FormElements/Input";
import { TextArea } from "@/components/FormElements/TextArea";
import { Switch } from "@/components/FormElements/Switch";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Encouragement, EncouragementPayload } from "@/models/notifications";

const schema = yup.object({
  text: yup
    .string()
    .trim()
    .required("Message is required")
    .max(240, "At most 240 characters"),
  reference: yup.string().trim().max(100, "At most 100 characters").default(""),
  isActive: yup.boolean().required().default(true),
});
type Values = yup.InferType<typeof schema>;

interface Props {
  encouragement: Encouragement | null;
  onClose: () => void;
  onSubmit: (payload: EncouragementPayload) => Promise<void>;
}

/** Mounted only while open, so defaults are fresh for each record. */
export const EncouragementFormModal: React.FC<Props> = ({
  encouragement,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(encouragement);
  const { control, handleSubmit, formState } = useForm<Values>({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: {
      text: encouragement?.text ?? "",
      reference: encouragement?.reference ?? "",
      isActive: encouragement?.isActive ?? true,
    },
  });
  const text = useWatch({ control, name: "text" });
  const formId = "encouragement-form";

  const submit = handleSubmit(async (v) => {
    try {
      await onSubmit({
        text: v.text.trim(),
        reference: v.reference?.trim() || undefined,
        isActive: v.isActive,
      });
      onClose();
    } catch {
      // API errors are toasted by the API client; keep the form open.
    }
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit message" : "Add message"}
      description="Short messages sent to members as encouragement pushes."
      footerStart={
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      }
      footer={
        <Button type="submit" form={formId} loading={formState.isSubmitting}>
          {isEdit ? "Save changes" : "Add message"}
        </Button>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="space-y-5">
        <Controller
          name="text"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextArea
              {...field}
              label="Message"
              required
              rows={4}
              maxLength={240}
              error={error?.message}
              labelSuffix={
                <span className="ml-auto font-mono text-2xs text-fg-muted">
                  {(text ?? "").length} / 240
                </span>
              }
            />
          )}
        />
        <Controller
          name="reference"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              label="Reference"
              placeholder="Isaiah 40:31"
              maxLength={100}
              error={error?.message}
              hint="Optional scripture reference."
            />
          )}
        />
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={field.onChange}
              color="emerald"
              label={field.value ? "Active" : "Inactive"}
              description="Inactive messages are skipped when picking what to send."
            />
          )}
        />
      </form>
    </Modal>
  );
};
