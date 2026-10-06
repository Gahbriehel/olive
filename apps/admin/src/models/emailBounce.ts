export type RecipientType = "PERSON" | "USER";

export type EmailDeliveryStatus =
  "DELIVERABLE" | "BOUNCED" | "DROPPED" | "COMPLAINED";

export interface EmailBounce {
  id: string;
  churchId?: string;
  email: string;
  resendEmailId?: string | null;
  eventType: string; // 'email.bounced' | 'email.failed' | 'email.suppressed' | 'email.complained'
  bounceType?: string | null; // 'Hard' | 'Soft'
  reason?: string | null;
  recipientType?: RecipientType | null;
  recipientId?: string | null;
  recipientName?: string | null;
  emailType?: string | null;
  registrationId?: string | null;
  isResolved: boolean;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

// Alias for convenience across table components
export type EmailBounceItem = EmailBounce;

export interface EmailBounceSummary {
  totalSent: number;
  totalBounces: number;
  resolvedBounces: number;
  unresolvedBounces: number;
  bounceRate: number;
  resolutionRate: number;
  deliveryRate: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrendStat {
  month: number;
  monthName: string;
  sentCount: number;
  bounceCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  bounceRate: number;
}

export interface DomainStat {
  domain: string;
  count: number;
}

export interface EmailBounceAnalyticsResponse {
  year: number;
  month?: number;
  summary: EmailBounceSummary;
  byEventType: CategoryBreakdown[];
  byBounceType: CategoryBreakdown[];
  byEmailType: CategoryBreakdown[];
  byRecipientType: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendStat[];
  topFailingDomains: DomainStat[];
}

// Alias for analytics
export type EmailBounceAnalytics = EmailBounceAnalyticsResponse;

export interface RemediateBouncePayload {
  newEmail: string;
  resendOriginal?: boolean;
  subject?: string;
}

export interface RemediateBounceResponse {
  success: boolean;
  message: string;
  bounce?: Partial<EmailBounce>;
  resend?: {
    attempted: boolean;
    succeeded: boolean;
  };
}

export enum EmailBounceTabFilter {
  ALL = "ALL",
  UNRESOLVED = "UNRESOLVED",
  HARD_BOUNCE = "HARD_BOUNCE",
  SOFT_BOUNCE = "SOFT_BOUNCE",
  RESOLVED = "RESOLVED",
}

export interface EmailBounceQueryParams {
  year?: number;
  month?: number;
  search?: string;
  isResolved?: boolean | string;
  eventType?: string;
  bounceType?: string;
  emailType?: string;
  recipientType?: string;
  page?: number;
  limit?: number;
}

export interface EmailBounceListResponse {
  data: EmailBounce[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: EmailBounceAnalyticsResponse;
}
