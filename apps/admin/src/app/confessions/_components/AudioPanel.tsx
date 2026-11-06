"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  CONFESSION_VOICES,
  ConfessionDetail,
  ConfessionVoice,
} from "@/models/confession";
import { AudioSlot } from "./AudioSlot";
import { KokoroGuideModal } from "./KokoroGuideModal";

interface Props {
  confession: ConfessionDetail;
  uploadingVoice?: ConfessionVoice;
  deletingVoice?: ConfessionVoice;
  onUpload: (voice: ConfessionVoice, file: File) => Promise<unknown>;
  onRemove: (voice: ConfessionVoice) => void;
}

export const AudioPanel: React.FC<Props> = ({
  confession,
  uploadingVoice,
  deletingVoice,
  onUpload,
  onRemove,
}) => {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <section aria-labelledby="audio-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 id="audio-heading" className="text-sm font-bold text-fg">
          Audio Recordings (Kokoro)
        </h3>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1 rounded text-xs font-medium text-primary-text hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden /> How to prepare
          audio
        </button>
      </div>

      {CONFESSION_VOICES.map((voice) => (
        <AudioSlot
          key={voice}
          voice={voice}
          audio={confession.audio?.[voice]}
          stale={confession.audioStale?.[voice]}
          uploading={uploadingVoice === voice}
          deleting={deletingVoice === voice}
          onUpload={(file) => onUpload(voice, file)}
          onRemove={() => onRemove(voice)}
        />
      ))}

      <KokoroGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </section>
  );
};
