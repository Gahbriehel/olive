"use client";

import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
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
      <Tabs
        label="Contact submissions"
        activeTab={activeTab}
        tabs={[
          {
            id: "prayers",
            label: "Prayers",
            href: "/contact/prayers",
            icon: <HeartHandshake className="h-4 w-4" />,
            count: prayerCount,
          },
          {
            id: "inquiries",
            label: "Inquiries",
            href: "/contact/inquiries",
            icon: <Mail className="h-4 w-4" />,
            count: inquiryCount,
          },
        ]}
      />
      <div>{children}</div>
    </div>
  );
}
