import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { DashboardProvider } from "@/context/DashboardContext";
import { MainShell } from "@/components/layout/MainShell";

export const metadata: Metadata = {
  title: "Church Events Platform",
  description:
    "Modern SaaS Admin Platform for Church Events, Attendance & Tournaments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>
          <DashboardProvider>
            <MainShell>{children}</MainShell>
          </DashboardProvider>
        </AppProviders>
      </body>
    </html>
  );
}
