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
}

// Event types
export type EventStatus = "CANCELLED" | "PUBLISHED" | "COMPLETED" | "DRAFT";
export type ApiEventStatus = EventStatus;

export interface ChurchEvent {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  games?: number;
  teams?: number;
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export interface IApiEvent {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity?: number;
  status: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
  createdAt?: string;
  updatedAt?: string;
  checkedInCount?: number;
  registeredCount?: number;
  games?: number;
  teams?: number;
}

export interface ICreateEventPayload {
  churchId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status?: ApiEventStatus;
  imageUrl?: string;
  googleCalendarSync?: boolean;
}

export type IUpdateEventPayload = Partial<ICreateEventPayload>;

// Person types
export type MembershipStatus = "Member" | "Visitor";
export type ApiGender = "MALE" | "FEMALE" | "OTHER";
export type ApiMembershipStatus = "VISITOR" | "MEMBER" | "WORKER" | "LEADER";

export interface IApiPerson {
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

export interface IApiRegistration {
  id: string;
  eventId: string;
  personId: string;
  teamId?: string;
  qrCode?: string;
  status: ApiRegistrationStatus;
  googleCalendarSync?: boolean;
  checkedInAt?: string;
  person?: IApiPerson;
  createdAt?: string;
}

export interface IRegisterPayload {
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
export interface ChurchSettings {
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

export interface ILeaderboardResponseData {
  eventId: string;
  eventTitle?: string;
  leaderboard: ILeaderboardEntry[];
}

