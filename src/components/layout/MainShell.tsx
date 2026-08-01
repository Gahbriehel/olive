"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { EventsForm } from "@/components/Forms/EventsForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { QrCode, CheckCircle2 } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";

export const MainShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, getProfile } = useAuth();

  const isAuthPage = pathname?.startsWith("/login");

  // Fetch user profile on startup / session restore
  useEffect(() => {
    if (isAuthenticated && !user && !isAuthPage) {
      getProfile();
    }
  }, [isAuthenticated, user, isAuthPage, getProfile]);

  // Route protection guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.push("/login");
      } else if (isAuthenticated && isAuthPage) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, isAuthPage, router]);

  const {
    isCreateEventOpen,
    setIsCreateEventOpen,
    isQrScannerOpen,
    setIsQrScannerOpen,
    handleCreateEvent,
    handleCheckIn,
  } = useDashboard();

  const [, setScannedRegId] = React.useState("");
  const [scanResult, setScanResult] = React.useState<string | null>(null);

  const simulateScan = (regNum: string) => {
    setScannedRegId(regNum);
    handleCheckIn(regNum, "QR Scan");
    setScanResult(`Checked in Registration #${regNum}`);
  };

  // 1. Standalone layout for Auth pages (Login)
  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
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
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-6">
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
            await handleCreateEvent({
              name: data.title,
              description: data.description || "",
              location: data.location || "",
              startDate: data.startDate,
              endDate: data.endDate,
              category: "General",
              capacity: 500,
              registrationDeadline: data.startDate,
              teamAssignmentEnabled: true,
              status: data.status || "DRAFT",
            });
            setIsCreateEventOpen(false);
          }}
        />
      </SidebarModal>

      <CommandMenu />

      {/* Global Quick QR Scanner Modal */}
      <Modal
        isOpen={isQrScannerOpen}
        onClose={() => {
          setIsQrScannerOpen(false);
          setScanResult(null);
        }}
        title="Quick Live QR Camera Check-in"
        description="Simulate camera scanning or quick-type registration numbers for instant gate arrival"
      >
        <div className="space-y-4 text-xs">
          <div className="relative aspect-video rounded-2xl bg-zinc-900 overflow-hidden flex flex-col items-center justify-center text-white border border-zinc-800 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent" />
            <div className="w-36 h-36 border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center relative animate-pulse">
              <QrCode className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="mt-3 text-zinc-400 font-mono text-[11px]">
              Camera active • Aiming at Badge QR
            </p>
          </div>

          {scanResult ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="font-semibold">{scanResult}</span>
            </div>
          ) : (
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Simulate Badge Scan:
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateScan("YC26-1001")}
                >
                  Scan #YC26-1001 (Jordan)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateScan("YC26-1002")}
                >
                  Scan #YC26-1002 (Chloe)
                </Button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsQrScannerOpen(false);
                setScanResult(null);
              }}
            >
              Close Camera
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
