import {
  LayoutDashboard,
  Calendar,
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
} from "lucide-react";
import { ROLES } from "@/utils/rbac";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
  allowedRoles?: string[];
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
    href: "/events",
    label: "Events",
    icon: Calendar,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  },
  {
    href: "/people",
    label: "People",
    icon: Users,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
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
    href: "/games",
    label: "Games",
    icon: Gamepad2,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  },
  // {
  //   href: "/messaging-center",
  //   label: "Messaging Center",
  //   icon: MessageCircle,
  //   allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  // },
  {
    href: "/contact",
    label: "Prayers & Inquiries",
    icon: Heart,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
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
