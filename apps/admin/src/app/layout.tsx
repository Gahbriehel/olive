import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { DashboardProvider } from "@/context/DashboardContext";
import { MainShell } from "@/components/layout/MainShell";

export const metadata: Metadata = {
  title: "Church Platform",
  description: "Platform for Church Administration, Events & Attendance",
  icons: {
    icon: "/icon1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('olive_theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
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
