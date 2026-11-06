import { ConfessionVoice } from "@/models/confession";

/** Dove serves audio from its host root, not under /api/v1. */
export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"
).replace(/\/api\/v\d+\/?$/, "");

export const audioSrc = (url: string) =>
  /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;

export const VOICE_LABEL: Record<ConfessionVoice, string> = {
  female: "Female",
  male: "Male",
};

export const VOICE_SHORT: Record<ConfessionVoice, string> = {
  female: "F",
  male: "M",
};

export function formatDuration(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Normalizes line endings and splits on blank lines into paragraphs. */
export function toParagraphs(body: string): string[] {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
