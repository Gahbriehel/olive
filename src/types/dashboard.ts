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

export type EventStatus = "Upcoming" | "Live" | "Completed" | "Draft";
export type MembershipStatus = "Member" | "Visitor";
export type RegistrationStatus = "Confirmed" | "Checked-In" | "Cancelled";
export type CheckInMethod = "QR Scan" | "Manual Search";
export type GameStatus = "Upcoming" | "In Progress" | "Completed";

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
  status: EventStatus;
  registrationDeadline: string;
  teamAssignmentEnabled: boolean;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  color: string; // e.g. 'Red', 'Cyan', 'Emerald', 'Amber'
  colorHex: string;
  captain: string;
  captainPhone: string;
  memberCount: number;
  totalPoints: number;
  badgeIcon: string;
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female";
  dob: string;
  membershipStatus: MembershipStatus;
  avatarUrl?: string;
  registrationHistoryCount: number;
  departmentsPlaceholder: string[];
  attendanceHistoryPlaceholder: {
    eventName: string;
    date: string;
    attended: boolean;
  }[];
  notesPlaceholder: string;
}

export interface Registration {
  id: string;
  registrationNumber: string;
  personId: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female";
  membershipStatus: MembershipStatus;
  assignedTeamId: string;
  assignedTeamName: string;
  assignedTeamColor: string;
  qrCodeUrl: string;
  qrGenerated: boolean;
  status: RegistrationStatus;
  confirmationSent: boolean;
  registeredAt: string;
  checkedInAt?: string;
}

export interface AttendanceRecord {
  id: string;
  registrationId: string;
  registrationNumber: string;
  attendeeName: string;
  teamName: string;
  teamColor: string;
  time: string;
  checkedInBy: string;
  method: CheckInMethod;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  maxPoints: number;
  order: number;
  status: GameStatus;
  winnerTeamId?: string;
  scores: { teamId: string; teamName: string; points: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  colorHex: string;
  totalPoints: number;
  gamesPlayed: number;
  rankChange: "up" | "down" | "same";
  captain: string;
}

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
