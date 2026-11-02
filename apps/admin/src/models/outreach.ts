import type { CheckInReason, CheckInStatus } from "@olive/types";

export type MessageChannel = "EMAIL" | "WHATSAPP";
export type OutreachPurpose =
  "BIRTHDAY" | "VISITOR_FOLLOW_UP" | "PASTORAL_CHECK_IN";
export type OutreachStatus = "OPENED" | "CONFIRMED_SENT" | "NOT_SENT";
export type OutreachWarning =
  | "NO_PHONE"
  | "INVALID_PHONE"
  | "WHATSAPP_OPT_OUT"
  | "NO_TEMPLATE"
  | "ALREADY_GREETED_THIS_YEAR"
  | "CONTACTED_RECENTLY";

export interface OutreachPreviewRequest {
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  templateId?: string;
}

export interface OutreachPreview {
  person: { id: string; firstName: string; lastName: string };
  toPhone: string | null; // E.164
  whatsappDigits: string | null; // no "+"
  template: { id: string; name: string } | null;
  alternatives: { id: string; name: string }[];
  body: string;
  lastOutreach: { at: string; by: string; purpose: OutreachPurpose } | null;
  warnings: OutreachWarning[];
}

export interface OutreachOpenPayload {
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  templateId?: string;
  body: string;
}

export interface OutreachMessage {
  id: string;
  personId: string;
  purpose: OutreachPurpose;
  status: OutreachStatus;
  body: string;
  toPhone: string;
  openedAt: string;
  confirmedAt: string | null;
  checkInId: string | null;
  sentBy: { id: string; name: string };
  person?: { id: string; firstName: string; lastName: string };
}

export interface MessageTemplate {
  id: string;
  channel: MessageChannel;
  purpose: OutreachPurpose;
  checkInReason: CheckInReason | null;
  name: string;
  body: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMessageTemplatePayload {
  channel: MessageChannel;
  purpose: OutreachPurpose;
  checkInReason?: CheckInReason | null;
  name: string;
  body: string;
}

export interface UpdateMessageTemplatePayload {
  name?: string;
  body?: string;
  isActive?: boolean;
  checkInReason?: CheckInReason | null;
}

export interface TemplatePreviewResponse {
  body: string;
  unknownPlaceholders: string[];
}

export interface OutreachQueryParams {
  personId?: string;
  purpose?: OutreachPurpose;
  status?: OutreachStatus;
  sentByUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface OutreachTodayResponse {
  birthdays: {
    total: number;
    items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      emailGreeted: boolean;
    }>;
  };
  checkIns: {
    total: number;
    items: Array<{
      id: string;
      personId: string;
      person: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
      };
      reason: CheckInReason;
      status: CheckInStatus;
      scheduledFor: string;
      assignedTo: { id: string; name: string } | null;
    }>;
  };
  visitorFollowUps: {
    total: number;
    items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      firstSeenDaysAgo?: number | null;
      firstSeenAt?: string | null;
      createdAt?: string | null;
    }>;
  };
  unconfirmed: {
    total: number;
    items: OutreachMessage[];
  };
}

export interface PersonMessageTimelineItem {
  type: "EMAIL" | "BIRTHDAY_EMAIL" | "WHATSAPP";
  purpose: OutreachPurpose | string;
  at: string;
  by: string;
  status: string;
  preview: string;
  refId: string;
}
