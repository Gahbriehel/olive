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
  Layers,
  HeartHandshake,
  DoorClosed,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

export interface FutureModule {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/people", label: "People", icon: Users },
  {
    href: "/registrations",
    label: "Registrations",
    icon: Ticket,
  },
  { href: "/teams", label: "Teams", icon: Shield },
  { href: "/attendance", label: "Attendance", icon: QrCode, highlight: true },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/users", label: "Users & Roles", icon: UserCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

// export const futureModules: FutureModule[] = [
//   { id: "small-groups", label: "Small Groups", icon: Layers },
//   { id: "giving", label: "Giving & Tithes", icon: HeartHandshake },
//   { id: "facilities", label: "Facilities & Rooms", icon: DoorClosed },
// ];
