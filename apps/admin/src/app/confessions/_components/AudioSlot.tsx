"use client";

import React, { useRef } from "react";
import { AlertTriangle, Music, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { customToast } from "@/helpers/customToast";
import {
  CONFESSION_AUDIO_MAX_BYTES,
  ConfessionAudioFile,
  ConfessionVoice,
} from "@/models/confession";
import { VOICE_LABEL, audioSrc, formatDuration } from "./confessionUtils";

interface Props {
  voice: ConfessionVoice;
  audio?: ConfessionAudioFile;
  stale?: boolean;
  uploading: boolean;
  deleting: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => void;
}

const isMp3 = (file: File) =>
  /\.mp3$/i.test(file.name) &&
  (file.type === "" || file.type === "audio/mpeg" || file.type === "audio/mp3");

export const AudioSlot: React.FC<Props> = ({
  voice,
  audio,
  stale,
  uploading,
  deleting,
  onUpload,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const label = VOICE_LABEL[voice];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!isMp3(file)) {
      customToast.error(
        "Invalid file. Only genuine MP3 audio files are supported.",
      );
      return;
    }
    if (file.size > CONFESSION_AUDIO_MAX_BYTES) {
      customToast.error("Audio file cannot exceed 25 MB.");
      return;
    }
    onUpload(file).catch(() => {});
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-fg-secondary">
          {label} voice
        </h4>
        {audio && stale && (
          <Badge size="sm" variant="amber">
            <AlertTriangle className="h-3 w-3" aria-hidden /> Audio Out of Date
          </Badge>
        )}
      </div>

      {audio ? (
        <div className="space-y-3">
          <audio
            controls
            preload="none"
            src={audioSrc(audio.url)}
            aria-label={`${label} voice recording`}
            className="w-full"
          />
          <p className="flex flex-wrap items-center gap-x-3 text-xs text-fg-muted">
            <span className="font-mono">
              {formatDuration(audio.durationSec)}
            </span>
            <span className="truncate font-mono">{audio.url}</span>
          </p>
          {stale && (
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning-text">
              The confession text was edited after this audio was uploaded.
              Please generate a new recording with Kokoro and upload to replace.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 py-3 text-center">
          <Music className="h-6 w-6 text-fg-subtle" aria-hidden />
          <p className="text-xs text-fg-muted">
            No audio uploaded yet. The member app will use built-in browser
            speech synthesis.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,.mp3"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label} voice MP3`}
        onChange={handleFile}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          loading={uploading}
          disabled={deleting}
          leftIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={() => inputRef.current?.click()}
        >
          {audio ? "Replace MP3" : "Upload MP3"}
        </Button>
        {audio && (
          <Button
            size="sm"
            variant="ghost"
            loading={deleting}
            disabled={uploading}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-danger-text" />}
            onClick={onRemove}
          >
            Delete Audio
          </Button>
        )}
      </div>
    </div>
  );
};
