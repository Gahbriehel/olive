"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KokoroGuideModal: React.FC<Props> = ({ isOpen, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Preparing Kokoro audio files"
    description="For church media staff recording confessions."
    footer={<Button onClick={onClose}>Got it</Button>}
  >
    <ol className="list-decimal space-y-2.5 pl-5 text-sm text-fg-secondary">
      <li>
        <strong>Kokoro TTS setup:</strong> generate the MP3s on a staff
        computer. Kokoro runs locally so the server doesn&apos;t run out of RAM.
      </li>
      <li>
        <strong>Voices:</strong> female <code>af_heart</code>, male{" "}
        <code>am_michael</code>.
      </li>
      <li>
        <strong>Pace:</strong> speed <code>0.9</code>, slightly slower than the
        Kokoro default, for clear devotional listening.
      </li>
      <li>
        <strong>Format:</strong> mono MP3 at 64 kbps or 128 kbps, under 25 MB.
      </li>
      <li>
        <strong>Silence:</strong> add about 0.7 seconds between paragraphs.
      </li>
      <li>
        <strong>Upload:</strong> open the confession here and use{" "}
        <em>Upload MP3</em> on the Female and Male slots.
      </li>
    </ol>
  </Modal>
);
