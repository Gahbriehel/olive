import { Person } from "@/types/dashboard";

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
}

export interface ICreatePersonPayload {
  churchId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ApiGender;
  membershipStatus?: ApiMembershipStatus;
  dateOfBirth?: string;
  address?: string;
}

export type IUpdatePersonPayload = Partial<ICreatePersonPayload>;

export interface IPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: "Male" | "Female";
  dob: string;
  membershipStatus: "Member" | "Visitor";
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

export function adaptApiPersonToPerson(apiPerson: IApiPerson): Person {
  const genderMap: Record<ApiGender, "Male" | "Female"> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Male",
  };

  const membershipMap: Record<ApiMembershipStatus, "Member" | "Visitor"> = {
    MEMBER: "Member",
    WORKER: "Member",
    LEADER: "Member",
    VISITOR: "Visitor",
  };

  return {
    id: apiPerson.id,
    name: `${apiPerson.firstName} ${apiPerson.lastName}`.trim(),
    phone: apiPerson.phone || "N/A",
    email: apiPerson.email || "N/A",
    gender: apiPerson.gender ? genderMap[apiPerson.gender] : "Male",
    dob: apiPerson.dateOfBirth
      ? new Date(apiPerson.dateOfBirth).toISOString().slice(0, 10)
      : "1995-01-01",
    membershipStatus: membershipMap[apiPerson.membershipStatus] || "Member",
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    registrationHistoryCount: 1,
    departmentsPlaceholder: ["General Assembly"],
    attendanceHistoryPlaceholder: [
      {
        eventName: "Youth Conference 2026",
        date: "Today",
        attended: true,
      },
    ],
    notesPlaceholder: "No notes added yet.",
  };
}

// Backwards compatibility aliases
export type ApiPerson = IApiPerson;
export type CreatePersonDto = ICreatePersonPayload;
export type UpdatePersonDto = IUpdatePersonPayload;
