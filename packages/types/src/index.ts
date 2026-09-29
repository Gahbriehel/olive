// Base types & helpers
export interface IBaseResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
  statusCode?: number;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface IQueryParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  eventId?: string;
  teamId?: string;
  membershipStatus?: string;
  gender?: string;
  type?: string;
  category?: string;
  isPrivate?: boolean;
  requiresRegistration?: boolean;
  isFeatured?: boolean;
}

// Event types
export type EventCategory =
  | "GENERAL"
  | "CONFERENCE"
  | "VIGIL"
  | "COMMUNION"
  | "REVIVAL"
  | "WORSHIP"
  | "OUTREACH";

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
export type ApiEventStatus = EventStatus;

export interface AdminEvent {
  id: string;
  churchId: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  location?: string | null;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: EventStatus;
  imageUrl?: string | null;
  googleCalendarSync: boolean;
  capacity?: number | null;
  requiresRegistration: boolean;
  highlights?: string[] | null;
  isFeatured: boolean;
  registeredCount: number;
  checkedInCount: number;
  teams: number;
  games: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateEventPayload {
  title: string;
  description?: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  status?: EventStatus;
  location?: string;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  requiresRegistration: boolean;
  capacity?: number | null;
  highlights?: string[];
  isFeatured?: boolean;
}

export interface IChurchEvent {
  id: string;
  churchId?: string;
  name: string;
  title?: string;
  category: EventCategory | string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number | null;
  registeredCount: number;
  checkedInCount: number;
  games?: number;
  teams?: number;
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
  imageUrl?: string | null;
  googleCalendarSync?: boolean;
  requiresRegistration: boolean;
  highlights?: string[] | null;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type IEventResponse = AdminEvent;
export type IEventPayload = CreateOrUpdateEventPayload;
export type IUpdateEventPayload = Partial<CreateOrUpdateEventPayload>;

// Person types
export type MembershipStatus = "Member" | "Visitor" | "Worker" | "Leader";
export type ApiGender = "MALE" | "FEMALE" | "OTHER";
export type ApiMembershipStatus = "VISITOR" | "MEMBER" | "WORKER" | "LEADER";

export interface IPersonResponse {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ApiGender;
  membershipStatus: ApiMembershipStatus;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  eventsRegisteredCount?: number;
  eventsAttendedCount?: number;
  department?: string;
  departments?: string[];
  notes?: string;
  avatarUrl?: string;
}

// Registration types
export type ApiRegistrationStatus = "REGISTERED" | "CHECKED_IN" | "CANCELLED";

export interface IRegistrationResponse {
  id: string;
  eventId: string;
  personId: string;
  teamId?: string;
  qrCode?: string;
  status: ApiRegistrationStatus;
  googleCalendarSync?: boolean;
  checkedInAt?: string;
  person?: IPersonResponse;
  createdAt?: string;
}

export interface IRegistrationPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  teamId?: string;
  googleCalendarSync?: boolean;
}

// Dashboard & Church Settings types
export interface IChurchSettings {
  id?: string;
  churchName: string;
  branchName?: string;
  campusName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  websiteUrl?: string;
  branding?: {
    primaryColor: string;
    logoText: string;
    logoUrl?: string;
    heroHeadline?: string;
    heroSubtitle?: string;
  };
  emailConfig?: {
    fromName: string;
    fromEmail: string;
    sendConfirmationEmails: boolean;
    sendReminder24h: boolean;
  };
  preferences?: {
    autoAssignTeams: boolean;
    requireQrCheckin: boolean;
    allowSelfRegistration: boolean;
  };
}

// Leaderboard types
export interface ILeaderboardEntry {
  rank?: number;
  teamId: string;
  teamName: string;
  color?: string;
  colorHex?: string;
  totalScore?: number;
  totalPoints?: number;
  memberCount?: number;
  gamesPlayed?: number;
}

export interface ILeaderboardResponse {
  eventId: string;
  eventTitle?: string;
  leaderboard: ILeaderboardEntry[];
}

// Contact Submission types
export type ContactSubmissionType = "prayer" | "inquiry";

export type PrayerCategory =
  | "Healing & Health"
  | "Family & Marriage"
  | "Financial Breakthrough"
  | "Spiritual Growth"
  | "General Prayer";

export type InquiryCategory =
  | "Visiting This Sunday"
  | "Small Groups / Ministries"
  | "Volunteering"
  | "General Question";

export interface ICreateContactSubmissionPayload {
  type: ContactSubmissionType;
  name: string;
  email: string;
  phone?: string;
  category: PrayerCategory | InquiryCategory;
  message: string;
  isPrivate?: boolean;
}

export interface IContactSubmissionResponse {
  id: string;
  churchId: string;
  type: ContactSubmissionType;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  message: string;
  isPrivate: boolean;
  createdAt: string;
}



