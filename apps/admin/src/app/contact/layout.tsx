"use client";

import { usePathname } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { TabLink } from "./_components/TabLink";
import { HeartHandshake, Mail, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useContactCounts } from "@/hooks/useContactQuery";

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTab = pathname.includes("prayers") ? "prayers" : "inquiries";
  const { prayerCount, inquiryCount } = useContactCounts();

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Prayers & Inquiries"
        description="Review and manage inbound Prayer requests and Inquiries"
        icon={MessagesSquare}
      />
      <Tabs.Root value={activeTab}>
        <Tabs.List className="flex items-center gap-2 p-1.5 bg-surface rounded-2xl w-fit border border-border shadow-xs">
          <TabLink
            value="prayers"
            href="/contact/prayers"
            icon={<HeartHandshake className="w-4 h-4" />}
            count={prayerCount}
          >
            Prayers
          </TabLink>
          <TabLink
            value="inquiries"
            href="/contact/inquiries"
            icon={<Mail className="w-4 h-4" />}
            count={inquiryCount}
          >
            Inquiries
          </TabLink>
        </Tabs.List>

        <div className="mt-6">{children}</div>
      </Tabs.Root>
    </div>
  );
}
