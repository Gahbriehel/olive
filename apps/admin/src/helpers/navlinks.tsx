import {
  LayoutDashboard,
  Calendar,
  CalendarRange,
  Users,
  Ticket,
  Shield,
  QrCode,
  Gamepad2,
  Trophy,
  UserCheck,
  Settings,
  LucideIcon,
  MessageCircle,
  Heart,
  BarChart3,
  Cake,
  MailWarning,
} from "lucide-react";
import { ROLES, hasAuthority } from "@/utils/rbac";

export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
  allowedRoles?: string[];
  subs?: NavItem[];
}

export interface FutureModule {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    href: "/people",
    label: "People",
    icon: Users,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  },
  {
    label: "Event Management",
    icon: CalendarRange,
    allowedRoles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.COORDINATOR,
      ROLES.REGISTRATION_DESK,
    ],
    subs: [
      {
        href: "/events",
        label: "Events",
        icon: Calendar,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
      },
      {
        href: "/games",
        label: "Games",
        icon: Gamepad2,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
      },
      {
        href: "/attendance",
        label: "Attendance",
        icon: QrCode,
        highlight: true,
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.COORDINATOR,
          ROLES.REGISTRATION_DESK,
        ],
      },
      {
        href: "/registrations",
        label: "Registrations",
        icon: Ticket,
        allowedRoles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.COORDINATOR,
          ROLES.REGISTRATION_DESK,
        ],
      },
      {
        href: "/teams",
        label: "Teams",
        icon: Shield,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
      },
      {
        href: "/leaderboard",
        label: "Leaderboard",
        icon: Trophy,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
      },
    ],
  },
  {
    href: "/contact",
    label: "Prayers & Inquiries",
    icon: Heart,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    href: "/messaging-center",
    label: "Messaging Center",
    icon: MessageCircle,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    label: "Reports",
    icon: BarChart3,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
    subs: [
      {
        href: "/reports/birthdays",
        label: "Birthdays",
        icon: Cake,
        allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
      },
      {
        href: "/reports/bounces",
        label: "Email Bounces",
        icon: MailWarning,
        allowedRoles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    href: "/users",
    label: "Users & Roles",
    icon: UserCheck,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
];

/** Nav tree limited to what the given roles may see (empty groups dropped). */
export function filterNavItems(
  items: NavItem[],
  userRoles: string[],
): NavItem[] {
  return items
    .filter((item) => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return hasAuthority(userRoles, item.allowedRoles);
      }
      return true;
    })
    .map((item) => {
      if (item.subs) {
        return {
          ...item,
          subs: filterNavItems(item.subs, userRoles),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.subs && item.subs.length === 0 && !item.href) {
        return false;
      }
      return true;
    });
}
