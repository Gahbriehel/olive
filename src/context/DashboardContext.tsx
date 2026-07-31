"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  UserRole,
  ChurchEvent,
  Registration,
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
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/hooks/useAuth";
import { adaptApiEventToChurchEvent } from "@/models/event";

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

  // Global lightweight datasets & settings
  events: ChurchEvent[];
  settings: ChurchSettings;

  // Handlers
  handleCheckIn: (regId: string, method: CheckInMethod) => void;
  handleCreateEvent: (
    newEvent: Omit<
      ChurchEvent,
      "id" | "registeredCount" | "checkedInCount" | "status"
    >,
  ) => void;
  handleUpdateSettings: (newSettings: ChurchSettings) => void;
  handleExportCsv: (registrations?: Registration[]) => void;
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
  const [selectedEventIdState, setSelectedEventId] = useState<string>("");

  // React Query Hooks (Only events for active event selection)
  const { user } = useAuth();
  const { events: apiEvents, createEvent } = useEvents();
  const { checkIn: apiCheckIn } = useAttendance();

  // Settings
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);

  // Derived adapted events
  const events = useMemo(() => {
    if (Array.isArray(apiEvents)) {
      return apiEvents.map((e) => adaptApiEventToChurchEvent(e));
    }
    return [];
  }, [apiEvents]);

  // Derived active event ID (defaults to first event if unselected or missing)
  const selectedEventId = useMemo(() => {
    if (
      selectedEventIdState &&
      events.some((e) => e.id === selectedEventIdState)
    ) {
      return selectedEventIdState;
    }
    return events[0]?.id || "";
  }, [selectedEventIdState, events]);

  // Derived user role & church name
  const userRole = user?.userRoles?.[0]?.role?.name as UserRole | undefined;
  const effectiveRole = userRole || currentRole;

  const dynamicChurchName = user?.church?.name || user?.churchName;
  const effectiveSettings = useMemo(() => {
    if (dynamicChurchName && settings.churchName === "Church Events") {
      return { ...settings, churchName: dynamicChurchName };
    }
    return settings;
  }, [dynamicChurchName, settings]);

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
  const handleCheckIn = async (token: string) => {
    try {
      await apiCheckIn({ token });
    } catch {
      // Handle error gracefully
    }
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
      setSelectedEventId(adapted.id);
    } catch {
      // Fallback
    }
  };

  const handleUpdateSettings = (newSettings: ChurchSettings) => {
    setSettings(newSettings);
  };

  const handleExportCsv = (registrations: Registration[] = []) => {
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
        currentRole: effectiveRole,
        setCurrentRole,
        selectedEventId,
        setSelectedEventId,
        activeEvent,
        events,
        settings: effectiveSettings,
        handleCheckIn,
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
