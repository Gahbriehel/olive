import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/context/query-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Amazing Grace Bible Church | Salvation, Healing & Miracles",
    template: "%s | Amazing Grace Bible Church",
  },
  description:
    "Welcome to Amazing Grace Bible Church. Join us for Sunday worship, experience salvation, healing and miracles, and connect with our vibrant community.",
  openGraph: {
    title: "Amazing Grace Bible Church",
    description:
      "Join us this Sunday for worship, connection, and community events.",
    siteName: "Amazing Grace Bible Church",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-amber-500 selection:text-white flex flex-col min-h-screen bg-[#0B1426] text-white">
        <QueryProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
