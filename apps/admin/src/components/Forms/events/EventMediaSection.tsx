import React from "react";
import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useUploadFlyer } from "@/hooks/useUploads";
import { type EventFormValues } from "../schemas/eventSchema";
import { EventFormSection } from "./EventFormSection";

interface EventMediaSectionProps {
  control: Control<EventFormValues>;
  setValue: UseFormSetValue<EventFormValues>;
  isUploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
}

/** Flyer URL, flyer upload and preview. */
export function EventMediaSection({
  control,
  setValue,
  isUploading,
  onUploadingChange,
}: EventMediaSectionProps) {
  const imageUrlValue = useWatch({ control, name: "imageUrl" });
  const { uploadFlyer } = useUploadFlyer();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onUploadingChange(true);
      const uploadedUrl = await uploadFlyer(file);
      setValue("imageUrl", uploadedUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Toast handled by api client interceptor
    } finally {
      onUploadingChange(false);
    }
  };

  return (
    <EventFormSection
      icon={<ImageIcon className="w-4 h-4 text-primary" />}
      title="Flyer & Promotional Media"
    >
      <div className="space-y-3">
        <Controller
          name="imageUrl"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              label="Flyer Image URL"
              placeholder="https://... or upload image below"
              error={error?.message}
            />
          )}
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted hover:bg-muted-strong cursor-pointer text-xs font-semibold text-fg-secondary transition-colors border border-border-control">
            {isUploading ? (
              <Spinner size="sm" />
            ) : (
              <Upload className="w-4 h-4 text-primary" />
            )}
            <span>{isUploading ? "Uploading..." : "Upload Flyer Image"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden cursor-pointer"
            />
          </label>
          <span className="text-2xs text-fg-muted">
            Max 3MB (JPEG, PNG, WEBP)
          </span>
        </div>

        {imageUrlValue && (
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-control bg-subtle group mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrlValue}
              alt="Flyer Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setValue("imageUrl", "", { shouldDirty: true })}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-danger transition-colors cursor-pointer"
              title="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </EventFormSection>
  );
}
