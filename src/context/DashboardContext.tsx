"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  INITIAL_EVENTS,
  INITIAL_TEAMS,
  INITIAL_PEOPLE,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCE_LOG,
  INITIAL_GAMES,
  INITIAL_USERS,
  DEFAULT_SETTINGS,
} from "@/lib/mock-data";
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
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-1");

  // Datasets
  const [events, setEvents] = useState<ChurchEvent[]>(INITIAL_EVENTS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [registrations, setRegistrations] = useState<Registration[]>(
    INITIAL_REGISTRATIONS,
  );
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>(
    INITIAL_ATTENDANCE_LOG,
  );
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [adminUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Sync dark class on root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handlers
  const handleCheckIn = (regId: string, method: CheckInMethod) => {
    const reg = registrations.find(
      (r) => r.id === regId || r.registrationNumber === regId,
    );
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

  const handleUpdateGameScores = (
    gameId: string,
    updatedScores: { teamId: string; points: number }[],
  ) => {
    const targetGame = games.find((g) => g.id === gameId);
    if (!targetGame) return;

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback if canvas confetti unavailable
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

    // Recalculate team total points
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

  const handleCreateEvent = (
    newEventData: Omit<
      ChurchEvent,
      "id" | "registeredCount" | "checkedInCount" | "status"
    >,
  ) => {
    const newEvt: ChurchEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      status: "Upcoming",
      registeredCount: 0,
      checkedInCount: 0,
    };
    setEvents([newEvt, ...events]);
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
