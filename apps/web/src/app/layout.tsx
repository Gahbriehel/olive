import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/query-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Amazing Grace Bible Church | Salvation, Healing & Miracles",
    template: "%s | Amazing Grace Bible Church",
  },
  description:
    "Welcome to Amazing Grace Bible Church (registered as Abiding Word Of Grace Missions). Join us for Sunday worship, experience salvation, healing and miracles, and connect with our vibrant community.",
  openGraph: {
    title: "Amazing Grace Bible Church",
    description:
      "Join us this Sunday for worship, connection, and community events. Amazing Grace Bible Church is a ministry of Abiding Word Of Grace Missions.",
    siteName: "Amazing Grace Bible Church",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/images/icon-gold.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${playfair.variable} antialiased selection:bg-[#B18A4A] selection:text-white flex flex-col min-h-screen bg-[#171717] text-[#F7F5F0]`}
      >
        <QueryProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
