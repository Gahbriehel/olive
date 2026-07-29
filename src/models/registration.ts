import { Registration } from "@/types/dashboard";
import { IApiPerson } from "./person";
import { IApiTeam } from "./team";

export type ApiRegistrationStatus = "REGISTERED" | "CHECKED_IN" | "CANCELLED";

export interface IApiRegistration {
  id: string;
  eventId: string;
  personId: string;
  teamId?: string;
  qrCode?: string;
  status: ApiRegistrationStatus;
  checkedInAt?: string;
  person?: IApiPerson;
  team?: IApiTeam;
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
}

export interface ICheckInPayload {
  token: string; // QR code or Registration ID
}

export interface IRegistration {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female";
  membershipStatus: "Member" | "Visitor";
  assignedTeamId: string;
  assignedTeamName: string;
  assignedTeamColor: string;
  status: "Registered" | "Checked-In";
  registeredAt: string;
  checkedInAt?: string;
  qrCodeUrl?: string;
}

export function adaptApiRegistrationToRegistration(
  apiReg: IApiRegistration,
): Registration {
  const person = apiReg.person;
  const team = apiReg.team;

  return {
    id: apiReg.id,
    registrationNumber: apiReg.qrCode || `REG-${apiReg.id.slice(0, 8)}`,
    personId: apiReg.personId,
    name: person ? `${person.firstName} ${person.lastName}`.trim() : "Attendee",
    email: person?.email || "N/A",
    phone: person?.phone || "N/A",
    gender: person?.gender === "FEMALE" ? "Female" : "Male",
    membershipStatus:
      person?.membershipStatus === "VISITOR" ? "Visitor" : "Member",
    assignedTeamId: team?.id || "",
    assignedTeamName: team?.name || "Unassigned",
    assignedTeamColor: team?.colorHex || "#94A3B8",
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(apiReg.qrCode || apiReg.id)}`,
    qrGenerated: true,
    status: apiReg.status === "CHECKED_IN" ? "Checked-In" : "Confirmed",
    confirmationSent: true,
    registeredAt: apiReg.createdAt
      ? new Date(apiReg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }) + " Today"
      : "Today",
    checkedInAt: apiReg.checkedInAt,
  };
}

// Backwards compatibility aliases
export type ApiRegistration = IApiRegistration;
export type RegisterDto = IRegisterPayload;
export type CheckInDto = ICheckInPayload;
