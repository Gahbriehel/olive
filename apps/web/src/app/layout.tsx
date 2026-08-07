import type { Metadata } from "next";
import { Outfit, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/context/query-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const abhayaLibre = Abhaya_Libre({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-serif",
});

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
        className={`${outfit.variable} ${abhayaLibre.variable} antialiased selection:bg-amber-500 selection:text-white flex flex-col min-h-screen bg-[#0B1426] text-white`}
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
