import { MembershipStatus } from "./person";
import { IPersonResponse } from "./person";
import { ITeamResponse } from "./team";
import { formatDateTimeDisplay } from "@/utils/formatters";

export type RegistrationStatus = "Confirmed" | "Checked-In" | "Cancelled";
export type CheckInMethod = "QR Scan" | "Manual Search";

export interface IRegistration {
  id: string;
  registrationNumber: string;
  personId: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female";
  membershipStatus: MembershipStatus;
  assignedTeamId: string;
  team: ITeamResponse;
  person: IPersonResponse;
  qrCodeUrl: string;
  qrGenerated: boolean;
  token: string;
  status: RegistrationStatus;
  googleCalendarSync?: boolean;
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

export type ApiRegistrationStatus = "REGISTERED" | "CHECKED_IN" | "CANCELLED";

export interface IRegistrationResponse {
  id: string;
  eventId: string;
  personId: string;
  teamId?: string;
  qrCode?: string;
  token: string;
  registrationNumber: string;
  status: ApiRegistrationStatus;
  googleCalendarSync?: boolean;
  checkedInAt?: string;
  person?: IPersonResponse;
  team?: ITeamResponse;
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

export interface ICheckInPayload {
  token: string; // QR code or Registration ID
}

export function adaptApiRegistrationToRegistration(
  apiReg: IRegistrationResponse,
): IRegistration {
  const person = apiReg.person;
  const team = apiReg.team;

  return {
    id: apiReg.id,
    registrationNumber:
      apiReg.qrCode || apiReg.registrationNumber || apiReg.token,
    personId: apiReg.personId,
    name: person ? `${person.firstName} ${person.lastName}`.trim() : "Attendee",
    email: person?.email || "N/A",
    phone: person?.phone || "N/A",
    gender: person?.gender === "FEMALE" ? "Female" : "Male",
    membershipStatus:
      person?.membershipStatus && person.membershipStatus !== "VISITOR"
        ? "Member"
        : "Visitor",
    assignedTeamId: team?.id || "",
    team: team!,
    person: person!,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(apiReg.qrCode || apiReg.id)}`,
    qrGenerated: true,
    status: apiReg.status === "CHECKED_IN" ? "Checked-In" : "Confirmed",
    googleCalendarSync: apiReg.googleCalendarSync ?? false,
    confirmationSent: true,
    token: apiReg.token,
    registeredAt: apiReg.createdAt
      ? formatDateTimeDisplay(apiReg.createdAt)
      : "N/A",
    checkedInAt: apiReg.checkedInAt,
  };
}
