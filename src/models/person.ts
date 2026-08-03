export type MembershipStatus = "Member" | "Visitor";
export type ApiGender = "MALE" | "FEMALE" | "OTHER";
export type ApiMembershipStatus = "VISITOR" | "MEMBER" | "WORKER" | "LEADER";

export interface IPersonRegistrationHistory {
  id: string;
  status: string;
  createdAt?: string;
  event?: {
    id: string;
    title: string;
    startDate: string;
    status: string;
    location?: string;
  };
  team?: {
    id: string;
    name: string;
    color?: string;
  };
  attendance?: {
    id: string;
    checkedInAt: string;
    checkedInBy?: string;
  } | null;
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
  eventsAttendedCount: number;
  registrations: {
    id: string;
    eventId?: string;
    eventTitle: string;
    eventDate: string;
    teamName: string;
    teamColor: string;
    status: string;
    attended: boolean;
    checkedInAt?: string;
  }[];
  departmentsPlaceholder: string[];
  attendanceHistory: {
    id: string;
    eventName: string;
    date: string;
    attended: boolean;
    checkedInAt?: string;
  }[];
  notesPlaceholder: string;
}

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
  registrations?: IPersonRegistrationHistory[];
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

export type IPerson = Person;

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

  const rawRegistrations = apiPerson.registrations || [];

  const registrations = rawRegistrations.map((reg) => {
    const eventTitle = reg.event?.title || "Event";
    const eventDate = reg.event?.startDate
      ? new Date(reg.event.startDate).toLocaleDateString()
      : "N/A";
    const teamName = reg.team?.name || "Unassigned";
    const teamColor = reg.team?.color || "#6366F1";
    const attended = reg.attendance !== null && reg.attendance !== undefined;
    const checkedInAt = reg.attendance?.checkedInAt
      ? new Date(reg.attendance.checkedInAt).toLocaleString()
      : undefined;

    return {
      id: reg.id,
      eventId: reg.event?.id,
      eventTitle,
      eventDate,
      teamName,
      teamColor,
      status: reg.status,
      attended,
      checkedInAt,
    };
  });

  const attendanceHistory = registrations.map((r) => ({
    id: r.id,
    eventName: r.eventTitle,
    date: r.checkedInAt || r.eventDate,
    attended: r.attended,
    checkedInAt: r.checkedInAt,
  }));

  const eventsRegisteredCount =
    apiPerson.eventsRegisteredCount ?? registrations.length;
  const eventsAttendedCount =
    apiPerson.eventsAttendedCount ??
    registrations.filter((r) => r.attended).length;

  return {
    id: apiPerson.id,
    name: `${apiPerson.firstName} ${apiPerson.lastName}`.trim(),
    phone: apiPerson.phone || "N/A",
    email: apiPerson.email || "N/A",
    gender: apiPerson.gender ? genderMap[apiPerson.gender] : "Male",
    dob: apiPerson.dateOfBirth
      ? new Date(apiPerson.dateOfBirth).toISOString().slice(0, 10)
      : "N/A",
    membershipStatus: membershipMap[apiPerson.membershipStatus] || "Member",
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
    registrationHistoryCount: eventsRegisteredCount,
    eventsAttendedCount,
    registrations,
    departmentsPlaceholder: ["General Assembly"],
    attendanceHistory,
    notesPlaceholder: "No notes added yet.",
  };
}

// Backwards compatibility aliases
export type ApiPerson = IApiPerson;
export type CreatePersonDto = ICreatePersonPayload;
export type UpdatePersonDto = IUpdatePersonPayload;
