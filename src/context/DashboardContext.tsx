"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  UserRole,
  ChurchEvent,
  Team,
  Person,
  Registration,
  AttendanceRecord,
  Game,
  AdminUser,
  ChurchSettings,
  CheckInMethod,
} from "@/types/dashboard";

const DEFAULT_SETTINGS: ChurchSettings = {
  churchName: "Church Events",
  campusName: "Main Campus",
  address: "742 Evergreen Terrace, Metropolis",
  phone: "+1 (555) 000-1234",
  email: "info@gracecity.org",
  website: "https://gracecity.org",
  branding: {
    primaryColor: "#6366f1",
    logoText: "GRACE CITY EVENTS",
  },
  emailConfig: {
    fromName: "Grace City Youth Events",
    fromEmail: "events@gracecity.org",
    sendConfirmationEmails: true,
    sendReminder24h: true,
  },
  preferences: {
    autoAssignTeams: true,
    requireQrCheckin: true,
    allowSelfRegistration: true,
  },
};
import { useEvents } from "@/hooks/useEvents";
import { usePeople } from "@/hooks/usePeople";
import { useTeams } from "@/hooks/useTeams";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAttendance } from "@/hooks/useAttendance";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/hooks/useAuth";
import { adaptApiEventToChurchEvent } from "@/models/event";
import { adaptApiPersonToPerson } from "@/models/person";
import { adaptApiTeamToTeam } from "@/models/team";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiGameToGame } from "@/models/game";

interface DashboardContextType {
  // Theme & Layout
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCreateEventOpen: boolean;
  setIsCreateEventOpen: (open: boolean) => void;
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Active Role & Context
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  activeEvent: ChurchEvent;

  // Datasets
  events: ChurchEvent[];
  teams: Team[];
  people: Person[];
  registrations: Registration[];
  attendanceLog: AttendanceRecord[];
  games: Game[];
  adminUsers: AdminUser[];
  settings: ChurchSettings;

  // Handlers
  handleCheckIn: (regId: string, method: CheckInMethod) => void;
  handleReassignTeam: (regId: string, newTeamId: string) => void;
  handleUpdateGameScores: (
    gameId: string,
    updatedScores: { teamId: string; points: number }[],
  ) => void;
  handleCreateEvent: (
    newEvent: Omit<
      ChurchEvent,
      "id" | "registeredCount" | "checkedInCount" | "status"
    >,
  ) => void;
  handleUpdateSettings: (newSettings: ChurchSettings) => void;
  handleExportCsv: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<UserRole>("Super Admin");
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // React Query Hooks
  const { user } = useAuth();
  const { events: apiEvents, createEvent } = useEvents();
  const { people: apiPeople } = usePeople();
  const { teams: apiTeams } = useTeams(selectedEventId);
  const registrationsParams = React.useMemo(
    () => ({ eventId: selectedEventId }),
    [selectedEventId],
  );
  const { registrations: apiRegistrations } =
    useRegistrations(registrationsParams);
  const { checkIn: apiCheckIn } = useAttendance();
  const { games: apiGames, recordScore: apiRecordScore } =
    useGames(selectedEventId);

  // Datasets state (zero mock fallbacks)
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [adminUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);

  // Sync API Events when available
  useEffect(() => {
    if (Array.isArray(apiEvents)) {
      const adaptedEvents = apiEvents.map((e) => adaptApiEventToChurchEvent(e));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEvents(adaptedEvents);
      if (
        adaptedEvents.length > 0 &&
        (!selectedEventId ||
          !adaptedEvents.some((e) => e.id === selectedEventId))
      ) {
        setSelectedEventId(adaptedEvents[0].id);
      }
    }
  }, [apiEvents, selectedEventId]);

  // Sync API People when available
  useEffect(() => {
    if (Array.isArray(apiPeople)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPeople(apiPeople.map((p) => adaptApiPersonToPerson(p)));
    }
  }, [apiPeople]);

  // Sync API Teams when available
  useEffect(() => {
    if (Array.isArray(apiTeams)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTeams(apiTeams.map((t) => adaptApiTeamToTeam(t)));
    }
  }, [apiTeams]);

  // Sync API Registrations when available
  useEffect(() => {
    if (Array.isArray(apiRegistrations)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistrations(
        apiRegistrations.map((r) => adaptApiRegistrationToRegistration(r)),
      );
    }
  }, [apiRegistrations]);

  // Sync API Games when available
  useEffect(() => {
    if (Array.isArray(apiGames)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGames(apiGames.map((g, index) => adaptApiGameToGame(g, index + 1)));
    }
  }, [apiGames]);

  // Sync User role if available from Redux auth
  useEffect(() => {
    if (user?.userRoles?.[0]?.role?.name) {
      const roleName = user.userRoles[0].role.name as UserRole;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentRole(roleName);
    }

    // Sync dynamic church name from logged in user profile
    const dynamicChurchName = user?.church?.name || user?.churchName;
    if (dynamicChurchName && settings.churchName === "Church Events") {
      setSettings((prev) => ({
        ...prev,
        churchName: dynamicChurchName,
      }));
    }
  }, [user]);

  const fallbackEvent: ChurchEvent = {
    id: "none",
    name: "No Active Event",
    category: "General",
    description: "Create or select an event to get started",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    location: "Main Sanctuary",
    capacity: 500,
    registeredCount: 0,
    checkedInCount: 0,
    status: "Upcoming",
    registrationDeadline: new Date().toISOString(),
    teamAssignmentEnabled: true,
  };

  const activeEvent =
    events.find((e) => e.id === selectedEventId) || events[0] || fallbackEvent;

  // Sync dark class on root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handlers
  const handleCheckIn = async (regId: string, method: CheckInMethod) => {
    const reg = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );

    if (reg) {
      try {
        await apiCheckIn({ token: reg.registrationNumber });
      } catch {
        // Handle error gracefully
      }
    }

    if (!reg || reg.status === "Checked-In") return;

    // 1. Update registration status
    const updatedRegs = registrations.map((r) =>
      r.id === reg.id
        ? {
            ...r,
            status: "Checked-In" as const,
            checkedInAt: new Date().toISOString(),
          }
        : r,
    );
    setRegistrations(updatedRegs);

    // 2. Update active event checked-in count
    setEvents(
      events.map((e) =>
        e.id === selectedEventId
          ? { ...e, checkedInCount: e.checkedInCount + 1 }
          : e,
      ),
    );

    // 3. Add to live stream log
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newLog: AttendanceRecord = {
      id: `log-${Date.now()}`,
      registrationId: reg.id,
      attendeeName: reg.name,
      registrationNumber: reg.registrationNumber,
      teamName: reg.assignedTeamName,
      teamColor: reg.assignedTeamColor,
      time: `${timeStr} Today`,
      method,
      checkedInBy: currentRole,
    };
    setAttendanceLog([newLog, ...attendanceLog]);
  };

  const handleReassignTeam = (regId: string, newTeamId: string) => {
    const targetTeam = teams.find((t) => t.id === newTeamId);
    if (!targetTeam) return;

    setRegistrations(
      registrations.map((r) => {
        if (r.id === regId) {
          return {
            ...r,
            assignedTeamId: targetTeam.id,
            assignedTeamName: targetTeam.name,
            assignedTeamColor: targetTeam.colorHex,
          };
        }
        return r;
      }),
    );
  };

  const handleUpdateGameScores = async (
    gameId: string,
    updatedScores: { teamId: string; points: number }[],
  ) => {
    for (const score of updatedScores) {
      try {
        await apiRecordScore({
          gameId,
          teamId: score.teamId,
          points: score.points,
        });
      } catch {
        // Handle error
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    const updatedGames = games.map((g) => {
      if (g.id === gameId) {
        const scores = g.scores.map((s) => {
          const match = updatedScores.find((u) => u.teamId === s.teamId);
          return match ? { ...s, points: match.points } : s;
        });
        return { ...g, scores, status: "Completed" as const };
      }
      return g;
    });
    setGames(updatedGames);

    const teamPointsMap: Record<string, number> = {};
    updatedGames.forEach((g) => {
      g.scores.forEach((s) => {
        teamPointsMap[s.teamId] = (teamPointsMap[s.teamId] || 0) + s.points;
      });
    });

    setTeams(
      teams.map((t) => ({
        ...t,
        totalPoints: teamPointsMap[t.id] ?? t.totalPoints,
      })),
    );
  };

  const handleCreateEvent = async (
    newEventData: Omit<
      ChurchEvent,
      "id" | "registeredCount" | "checkedInCount" | "status"
    >,
  ) => {
    try {
      const created = await createEvent({
        title: newEventData.name,
        description: newEventData.description,
        location: newEventData.location,
        startDate: newEventData.startDate,
        endDate: newEventData.endDate,
        status: "PUBLISHED",
      });
      const adapted = adaptApiEventToChurchEvent(created);
      setEvents([adapted, ...events]);
      setSelectedEventId(adapted.id);
    } catch {
      // Fallback
    }
  };

  const handleUpdateSettings = (newSettings: ChurchSettings) => {
    setSettings(newSettings);
  };

  const handleExportCsv = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Email",
      "Phone",
      "Gender",
      "Membership",
      "Team",
      "Status",
    ];
    const rows = registrations.map((r) => [
      r.registrationNumber,
      `"${r.name}"`,
      r.email,
      r.phone,
      r.gender,
      r.membershipStatus,
      `"${r.assignedTeamName}"`,
      r.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `YC26_Registrations_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardContext.Provider
      value={{
        darkMode,
        setDarkMode,
        isMobileOpen,
        setIsMobileOpen,
        isCreateEventOpen,
        setIsCreateEventOpen,
        isQrScannerOpen,
        setIsQrScannerOpen,
        isSearchOpen,
        setIsSearchOpen,
        currentRole,
        setCurrentRole,
        selectedEventId,
        setSelectedEventId,
        activeEvent,
        events,
        teams,
        people,
        registrations,
        attendanceLog,
        games,
        adminUsers,
        settings,
        handleCheckIn,
        handleReassignTeam,
        handleUpdateGameScores,
        handleCreateEvent,
        handleUpdateSettings,
        handleExportCsv,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
