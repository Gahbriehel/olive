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
    default:
      "Abiding Word Of Grace Missions | Salvation, Healing & Deliverance",
    template: "%s | Abiding Word Of Grace Missions",
  },
  description:
    "Welcome to Abiding Word Of Grace Missions (a.k.a. Amazing Grace Bible Church). Join us for Sunday worship, experience salvation, healing and deliverance, and connect with our vibrant community.",
  openGraph: {
    title: "Abiding Word Of Grace Missions",
    description:
      "Join us this Sunday for worship. Experience salvation, healing and deliverance.",
    siteName:
      "Abiding Word Of Grace Missions (a.k.a. Amazing Grace Bible Church)",
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
