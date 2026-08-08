"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { UserRole, ChurchEvent, CheckInMethod } from "@/types/dashboard";

// Settings are now handled by useSettings hook

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
  activeEvent: ChurchEvent | undefined;

  // Global lightweight datasets & settings
  events: ChurchEvent[];

  // Handlers
  handleCheckIn: (regId: string, method?: CheckInMethod) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<UserRole>("Super Admin");
  const [selectedEventIdState, setSelectedEventId] = useState<string>("");

  // React Query Hooks (Only events for active event selection)
  const { user } = useAuth();
  const { events: apiEvents } = useEvents();
  const { checkIn: apiCheckIn } = useAttendance();

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

  // Derived user role
  const userRole = user?.userRoles?.[0]?.role?.name as UserRole | undefined;
  const effectiveRole = userRole || currentRole;

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Sync dark class on root document and persist theme choice
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("olive_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("olive_theme", "light");
    }
  }, [darkMode]);

  // Handlers
  const handleCheckIn = async (token: string, _method?: CheckInMethod) => {
    void _method;
    try {
      await apiCheckIn({ token });
    } catch {
      // Handle error gracefully
    }
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
        handleCheckIn,
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
