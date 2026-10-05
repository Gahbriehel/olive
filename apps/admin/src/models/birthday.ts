export enum MembershipStatus {
  VISITOR = "VISITOR",
  MEMBER = "MEMBER",
  WORKER = "WORKER",
  LEADER = "LEADER",
}

export enum BirthdayStatusFilter {
  ALL = "ALL",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
}

export interface BirthdayGreetingAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BirthdayGreetingRecord {
  id: string;
  year: number;
  subject: string;
  heading?: string | null;
  message: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sentAt: string;
  sentBy: BirthdayGreetingAuthor;
}

export interface BirthdayPersonItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  membershipStatus: MembershipStatus | string;
  dateOfBirth: string;
  birthdayDate: string;
  daysUntil: number; // 0 = today, >0 = upcoming, <0 = passed
  turningAge: number;
  status: "COMPLETED" | "PENDING" | "MISSED";
  isGreeted: boolean;
  greeting?: BirthdayGreetingRecord | null;
}

export interface BirthdayListResponse {
  data: BirthdayPersonItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MonthlyBirthdayStat {
  month: number;
  monthName: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
  handlingRate: number; // e.g. 85.50
}

export interface BirthdayAnalyticsResponse {
  year: number;
  month?: number;
  totalBirthdays: number;
  completedCount: number;
  pendingCount: number;
  missedCount: number;
  handlingRate: number; // percentage (0.00 - 100.00)
  monthlyBreakdown: MonthlyBirthdayStat[];
}

export interface SendBirthdayGreetingPayload {
  personId: string;
  year?: number; // Optional (defaults to current cycle year)
  subject: string;
  heading?: string;
  message: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface SendBirthdayGreetingResponse {
  message: string;
  greeting: BirthdayGreetingRecord;
}
