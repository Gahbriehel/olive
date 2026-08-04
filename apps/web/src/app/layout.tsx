import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { QueryProvider } from "@/context/query-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Grace City Church | Faith, Hope & Community",
    template: "%s | Grace City Church",
  },
  description:
    "Welcome home to Grace City Church. Join us for Sunday worship, connect with a vibrant community, and explore our upcoming events and registrations.",
  openGraph: {
    title: "Grace City Church",
    description:
      "Join us this Sunday for worship, connection, and community events.",
    siteName: "Grace City Church",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark suppressHydrationWarning">
      <body className="antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen">
        <QueryProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
