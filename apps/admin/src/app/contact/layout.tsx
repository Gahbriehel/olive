"use client";

import { usePathname } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { TabLink } from "./_components/TabLink";
import { HeartHandshake, Mail } from "lucide-react";

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTab = pathname.includes("prayers") ? "prayers" : "inquiries";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Contact Submissions
          </h1>
          <p className="text-slate-500 text-xs dark:text-slate-400">
            Review and manage inbound Prayer requests and Inquiries
          </p>
        </div>
      </div>
      <Tabs.Root value={activeTab}>
        <Tabs.List className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-900 rounded-2xl w-fit border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <TabLink
            value="prayers"
            href="/contact/prayers"
            icon={<HeartHandshake className="w-4 h-4" />}
          >
            Prayers
          </TabLink>
          <TabLink
            value="inquiries"
            href="/contact/inquiries"
            icon={<Mail className="w-4 h-4" />}
          >
            Inquiries
          </TabLink>
        </Tabs.List>

        <div className="mt-6">{children}</div>
      </Tabs.Root>
    </div>
  );
}
