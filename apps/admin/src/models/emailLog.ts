export type EmailLogDeliveryStatus = "DELIVERED" | "BOUNCED" | "COMPLAINED";
export type EmailDeliveryStatus = EmailLogDeliveryStatus;

export interface EmailLogRecipient {
  email: string | null;
  name: string | null;
}

export interface EmailLogSender {
  id: string;
  name: string;
  email: string;
}

export interface EmailLogContent {
  subject: string | null;
  heading: string | null;
  bodyTextSnippet: string | null;
}

export interface EmailLogContext {
  personId?: string | null;
  userId?: string | null;
  registrationId?: string | null;
}

export interface EmailLogBounce {
  bounceType: string;
  bounceSubType?: string | null;
  resolved: boolean;
  remediatedAt?: string | null;
}

export interface EmailLogItem {
  id: string;
  resendEmailId: string;
  emailType: string;
  deliveryStatus: EmailLogDeliveryStatus;
  createdAt: string; // ISO 8601
  recipient: EmailLogRecipient;
  sentBy: EmailLogSender | null; // null if automated / system triggered
  content: EmailLogContent;
  context: EmailLogContext;
  bounce?: EmailLogBounce | null;
}

export interface EmailLogResponse {
  success: boolean;
  message: string;
  data: {
    items: EmailLogItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
