import type {
  MembershipStatus,
  ApiGender,
  ApiMembershipStatus,
  FollowUpStatus,
  IPersonDepartment,
  CheckInReason,
  CheckInStatus,
  IPastoralCheckIn,
  IPastoralCheckInUserSummary,
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
} from "@olive/types";

export type {
  MembershipStatus,
  ApiGender,
  ApiMembershipStatus,
  FollowUpStatus,
  IPersonDepartment,
  CheckInReason,
  CheckInStatus,
  IPastoralCheckIn,
  IPastoralCheckInUserSummary,
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
};
export type ApiEmailStatus =
  "DELIVERABLE" | "BOUNCED" | "DROPPED" | "COMPLAINED";

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

export interface IPerson {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
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
  departments?: IPersonDepartment[];
  attendanceHistory: {
    id: string;
    eventName: string;
    date: string;
    attended: boolean;
    checkedInAt?: string;
  }[];
  followUpStatus?: FollowUpStatus;
  followUpNotes?: string;
  lastFollowUpAt?: string;
  notes?: string;
  address?: string;
  lastCheckInAt?: string | null;
  hasPendingCheckIn?: boolean;
  pastoralCheckIns?: IPastoralCheckIn[];
  rawGender?: ApiGender;
  rawMembershipStatus?: ApiMembershipStatus;
  dateOfBirth?: string;
  raw?: IPersonResponse;
}

export interface IPersonResponse {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ApiGender;
  membershipStatus: ApiMembershipStatus;
  emailBounceReason: string;
  emailBouncedAt: string;
  emailStatus: ApiEmailStatus;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  eventsRegisteredCount?: number;
  eventsAttendedCount?: number;
  registrations?: IPersonRegistrationHistory[];
  department?: string;
  departments?: (IPersonDepartment | string)[];
  followUpStatus?: FollowUpStatus;
  followUpNotes?: string;
  lastFollowUpAt?: string;
  notes?: string;
  avatarUrl?: string;
  lastCheckInAt?: string | null;
  hasPendingCheckIn?: boolean;
  pastoralCheckIns?: IPastoralCheckIn[];
}

export interface IPeopleStats {
  total: number;
  membership: {
    visitors: number;
    members: number;
    workers: number;
    leaders: number;
    pastors?: number;
  };
  gender: {
    male: number;
    female: number;
    other: number;
    unspecified: number;
  };
}

export interface IPersonPayload {
  churchId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: ApiGender;
  membershipStatus?: ApiMembershipStatus;
  followUpStatus?: FollowUpStatus;
  followUpNotes?: string;
  lastFollowUpAt?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface IPromotePersonPayload {
  membershipStatus: ApiMembershipStatus;
}

export type IUpdatePersonPayload = Partial<IPersonPayload>;

export const MEMBERSHIP_HIERARCHY: ApiMembershipStatus[] = [
  "VISITOR",
  "MEMBER",
  "WORKER",
  "LEADER",
  "PASTOR",
];

export function getNextMembershipTiers(
  current: ApiMembershipStatus | undefined,
): ApiMembershipStatus[] {
  if (!current) return ["MEMBER"];
  const currentIndex = MEMBERSHIP_HIERARCHY.indexOf(current);
  if (currentIndex === -1 || currentIndex >= MEMBERSHIP_HIERARCHY.length - 1) {
    return [];
  }
  return MEMBERSHIP_HIERARCHY.slice(currentIndex + 1);
}

export const membershipMap: Record<ApiMembershipStatus, MembershipStatus> = {
  MEMBER: "Member",
  WORKER: "Worker",
  LEADER: "Leader",
  VISITOR: "Visitor",
  PASTOR: "Pastor",
};

export const reverseMembershipMap: Record<
  MembershipStatus,
  ApiMembershipStatus
> = {
  Member: "MEMBER",
  Worker: "WORKER",
  Leader: "LEADER",
  Visitor: "VISITOR",
  Pastor: "PASTOR",
};

export function adaptApiPersonToPerson(apiPerson: IPersonResponse): IPerson {
  const genderMap: Record<ApiGender, "Male" | "Female"> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Male",
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

  let departments: IPersonDepartment[] = [];
  if (Array.isArray(apiPerson.departments)) {
    departments = apiPerson.departments.map((dept, index) => {
      if (typeof dept === "string") {
        return {
          id: `dept-${index}`,
          name: dept,
          role: "Member",
        };
      }
      return dept;
    });
  } else if (apiPerson.department) {
    departments = [
      {
        id: "dept-default",
        name: apiPerson.department,
        role: "Member",
      },
    ];
  }

  return {
    id: apiPerson.id,
    name: `${apiPerson.firstName} ${apiPerson.lastName}`.trim(),
    firstName: apiPerson.firstName || "",
    lastName: apiPerson.lastName || "",
    phone: apiPerson.phone || "N/A",
    email: apiPerson.email || "N/A",
    gender: apiPerson.gender ? genderMap[apiPerson.gender] : "Male",
    dob: apiPerson.dateOfBirth
      ? new Date(apiPerson.dateOfBirth).toISOString().slice(0, 10)
      : "N/A",
    membershipStatus: apiPerson.membershipStatus
      ? membershipMap[apiPerson.membershipStatus] || "Visitor"
      : "Visitor",
    avatarUrl: apiPerson.avatarUrl || undefined,
    registrationHistoryCount: eventsRegisteredCount,
    eventsAttendedCount,
    registrations,
    departments,
    attendanceHistory,
    followUpStatus: apiPerson.followUpStatus,
    followUpNotes: apiPerson.followUpNotes,
    lastFollowUpAt: apiPerson.lastFollowUpAt,
    notes: apiPerson.notes || "",
    address: apiPerson.address || "",
    lastCheckInAt: apiPerson.lastCheckInAt || null,
    hasPendingCheckIn: Boolean(apiPerson.hasPendingCheckIn),
    pastoralCheckIns: apiPerson.pastoralCheckIns || [],
    rawGender: apiPerson.gender,
    rawMembershipStatus: apiPerson.membershipStatus,
    dateOfBirth: apiPerson.dateOfBirth
      ? new Date(apiPerson.dateOfBirth).toISOString().slice(0, 10)
      : "",
    raw: apiPerson,
  };
}
