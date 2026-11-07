export type PushTopic =
  "night-prayer" | "confessions" | "scriptures" | "encouragement";

export const PUSH_TOPICS: PushTopic[] = [
  "night-prayer",
  "confessions",
  "scriptures",
  "encouragement",
];

export interface PushLogEntry {
  id: string;
  key: string;
  topic: PushTopic | string;
  title: string;
  body: string;
  url: string;
  recipients: number;
  delivered: number;
  failed: number;
  createdAt: string;
}

export interface PushOverview {
  subscribers: {
    total: number;
    byTopic: Partial<Record<PushTopic, number>>;
  };
  logs: PushLogEntry[];
}

export interface Encouragement {
  id: string;
  text: string;
  reference?: string | null;
  isActive: boolean;
  lastSentAt?: string | null;
}

export interface EncouragementPayload {
  text: string;
  reference?: string;
  isActive: boolean;
}

export interface EncouragementSlot {
  /** 0 = Sun .. 6 = Sat */
  day: number;
  /** "HH:mm" in Africa/Lagos */
  time: string;
}

export interface NotificationSettings {
  /** "HH:mm" */
  scriptureSendTime: string;
  encouragementSlots: EncouragementSlot[];
}

export const MAX_ENCOURAGEMENT_SLOTS = 14;
