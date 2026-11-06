export type ConfessionStatus = "DRAFT" | "PUBLISHED";
export type ConfessionVoice = "female" | "male";

export const CONFESSION_VOICES: ConfessionVoice[] = ["female", "male"];

export interface ConfessionAudioFile {
  /** e.g. /public/confession-audio/<id>/female-a1b2c3d4.mp3 */
  url: string;
  durationSec: number;
}

export type ConfessionAudioMap = Partial<
  Record<ConfessionVoice, ConfessionAudioFile>
>;

export type ConfessionAudioStaleMap = Partial<Record<ConfessionVoice, boolean>>;

export interface ConfessionNeighbour {
  slug: string;
  title: string;
}

export interface ConfessionListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  scriptureRef: string | null;
  category: string | null;
  status: ConfessionStatus;
  /** 1-based rank among published confessions, null for drafts. */
  position: number | null;
  wordCount: number;
  listenCount: number;
  audio: ConfessionAudioMap;
  audioStale?: ConfessionAudioStaleMap;
}

export interface ConfessionDetail extends ConfessionListItem {
  body: string;
  previous: ConfessionNeighbour | null;
  next: ConfessionNeighbour | null;
}

export interface CreateConfessionPayload {
  title: string;
  slug?: string;
  body: string;
  scriptureRef?: string | null;
  category?: string | null;
  status?: ConfessionStatus;
}

export type UpdateConfessionPayload = Partial<CreateConfessionPayload>;

export interface ReorderConfessionsPayload {
  ids: string[];
}

export const CONFESSION_AUDIO_MAX_BYTES = 25 * 1024 * 1024;
