"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { decodeQrFromImageFile } from "@/utils/qrDecoder";

interface ImageUploadPanelProps {
  onDecode: (code: string) => void;
  onError: (message: string | null) => void;
}

/** Drop zone / file picker that decodes a QR code from an image. */
export function ImageUploadPanel({ onDecode, onError }: ImageUploadPanelProps) {
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    let file: File | undefined;
    if ("files" in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ("dataTransfer" in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    setIsProcessingFile(true);
    try {
      const decoded = await decodeQrFromImageFile(file);
      if (decoded) {
        onDecode(decoded);
      } else {
        onError("Could not find or decode a valid QR code in this image.");
        setTimeout(() => onError(null), 4000);
      }
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileUpload}
        className="relative border-2 border-dashed border-border-control hover:border-primary focus-within:border-primary rounded-2xl p-8 text-center bg-subtle transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          aria-label="Upload a badge image to scan"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary-text flex items-center justify-center">
          {isProcessingFile ? (
            <Spinner size="md" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="font-bold text-fg">
            {isProcessingFile
              ? "Decoding QR image..."
              : "Drop badge photo or click to browse"}
          </p>
          <p className="text-2xs text-fg-muted mt-1">
            Supports PNG, JPG, WEBP badge screenshots or pass files
          </p>
        </div>
      </div>
    </div>
  );
}
