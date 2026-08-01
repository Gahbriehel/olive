export type UserRole =
  "Super Admin" | "Church Admin" | "Registration Desk" | "Games Coordinator";

export type NavTab =
  | "dashboard"
  | "events"
  | "event-detail"
  | "people"
  | "registrations"
  | "teams"
  | "attendance"
  | "games"
  | "leaderboard"
  | "users"
  | "settings";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
  lastActive: string;
  avatarUrl?: string;
}

export interface ChurchSettings {
  churchName: string;
  campusName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  branding: {
    primaryColor: string;
    logoText: string;
    logoUrl?: string;
  };
  emailConfig: {
    fromName: string;
    fromEmail: string;
    sendConfirmationEmails: boolean;
    sendReminder24h: boolean;
  };
  preferences: {
    autoAssignTeams: boolean;
    requireQrCheckin: boolean;
    allowSelfRegistration: boolean;
  };
}

export interface IDashboardOverview {
  totalRegistrations: number;
  totalCheckInsToday: number;
  totalVisitors: number;
  totalMembers: number;
  totalWorkers: number;
  totalLeaders: number;
  totalPeople: number;
  attendanceRate: number;
  totalEvents: number;
  activeEvents: number;
}

export interface IMembershipBreakdown {
  visitors: number;
  members: number;
  workers: number;
  leaders: number;
}

export interface IGenderBreakdown {
  male: number;
  female: number;
  other: number;
  unspecified: number;
}

export interface IDemographics {
  membership: IMembershipBreakdown;
  gender: IGenderBreakdown;
}

export interface IDashboardPerson {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  membershipStatus: string;
}

export interface IDashboardEventSummary {
  id: string;
  title: string;
  startDate: string;
  location?: string | null;
}

export interface IDashboardTeamSummary {
  id: string;
  name: string;
  color?: string | null;
}

export interface ILatestRegistration {
  id: string;
  registrationNumber: string;
  status: string;
  createdAt: string;
  person: IDashboardPerson;
  event: IDashboardEventSummary;
  team?: IDashboardTeamSummary | null;
}

export interface IUpcomingEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
  status: string;
  totalRegistrations: number;
  totalTeams: number;
}

export interface IDashboardData {
  overview: IDashboardOverview;
  demographics: IDemographics;
  latestRegistrations: ILatestRegistration[];
  upcomingEvents: IUpcomingEvent[];
}
