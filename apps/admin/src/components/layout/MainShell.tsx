"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { QrScannerModal } from "@/components/modals/QrScannerModal";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import {
  getUserRoles,
  hasAuthority,
  getDefaultRouteForUser,
  ROUTE_PERMISSIONS,
} from "@/utils/rbac";

export const MainShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, getProfile } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Sync mount state to prevent SSR/client hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isAuthPage = pathname?.startsWith("/login");
  const isKnownRoute =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/events") ||
    pathname?.startsWith("/people") ||
    pathname?.startsWith("/registrations") ||
    pathname?.startsWith("/teams") ||
    pathname?.startsWith("/attendance") ||
    pathname?.startsWith("/games") ||
    pathname?.startsWith("/scores") ||
    pathname?.startsWith("/leaderboard") ||
    pathname?.startsWith("/users") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/messaging-center") ||
    pathname?.startsWith("/contact");

  // Fetch user profile on startup / session restore
  useEffect(() => {
    if (isAuthenticated && !user && !isAuthPage && isKnownRoute) {
      getProfile();
    }
  }, [isAuthenticated, user, isAuthPage, isKnownRoute, getProfile]);

  // Route protection guard
  useEffect(() => {
    if (!isLoading && mounted && isKnownRoute) {
      if (!isAuthenticated && !isAuthPage) {
        router.push("/login");
      } else if (isAuthenticated) {
        if (isAuthPage) {
          const defaultRoute = getDefaultRouteForUser(user);
          router.push(defaultRoute);
          return;
        }

        // Check path permissions against RBAC matrix
        const userRoles = getUserRoles(user);
        const matchedPermission = Object.entries(ROUTE_PERMISSIONS).find(
          ([route]) => pathname === route || pathname.startsWith(`${route}/`),
        );

        if (matchedPermission) {
          const allowedRoles = matchedPermission[1];
          if (!hasAuthority(userRoles, allowedRoles)) {
            const fallbackRoute = getDefaultRouteForUser(user);
            if (pathname !== fallbackRoute) {
              router.push(fallbackRoute);
            }
          }
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isAuthPage,
    isKnownRoute,
    router,
    mounted,
    user,
    pathname,
  ]);

  const {
    isCreateEventOpen,
    setIsCreateEventOpen,
    isQrScannerOpen,
    setIsQrScannerOpen,
    handleCheckIn,
  } = useDashboard();
  const { createEvent } = useEvents();

  // 1. Standalone layout for Auth pages (Login) or unknown 404 routes
  if (isAuthPage || !isKnownRoute) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  // 2. Render same fallback state during SSR / initial hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // 2. Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  // 3. Fallback redirecting UI if unauthenticated on protected route
  if (!isAuthenticated) {
    // The router.push('/login') effect already fired — show a brief neutral
    // spinner. Avoid "Redirecting to login..." since authenticated users can
    // briefly land here during a reload before the token check resolves.
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // 4. Main Protected App Shell with Sidebar & Topbar
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans antialiased text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Sidebar />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <SidebarModal
        title="Create New Event"
        display={isCreateEventOpen}
        close={() => setIsCreateEventOpen(false)}
      >
        <EventsForm
          onCancel={() => setIsCreateEventOpen(false)}
          onSubmit={async (data) => {
            await createEvent({
              title: data.title,
              description: data.description || "",
              location: data.location || "",
              capacity: data.capacity || 0,
              startDate: data.startDate,
              endDate: data.endDate,
              status: data.status || "DRAFT",
              imageUrl: data.imageUrl,
              googleCalendarSync: data.googleCalendarSync,
            });
            setIsCreateEventOpen(false);
          }}
        />
      </SidebarModal>

      <CommandMenu />

      {/* Global Functional QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={(token, method) => {
          handleCheckIn(token, method);
        }}
        title="Gate Attendance Quick QR Scanner"
        description="Scan badge QR codes via live camera feed, handheld USB/Bluetooth hardware scanner, image upload, or manual code input."
      />
    </div>
  );
};
