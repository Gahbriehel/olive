import { IUser } from "@/models/auth";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINATOR",
  REGISTRATION_DESK: "REGISTRATION_DESK",
} as const;

export type RoleKey = (typeof ROLES)[keyof typeof ROLES];

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/events": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  "/teams": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  "/games": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  "/scores": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  "/leaderboard": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
  "/registrations": [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.REGISTRATION_DESK,
    "MEMBER",
  ],
  "/attendance": [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.REGISTRATION_DESK,
    "MEMBER",
  ],
  "/users": [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  "/settings": [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.REGISTRATION_DESK,
    "MEMBER",
  ],
  "/people": [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINATOR],
};

/**
 * Normalizes role display strings or backend keys to standard role keys
 * (e.g. "Super Admin" -> "SUPER_ADMIN", "Church Admin" -> "ADMIN", "Event Coordinator" / "Leader" -> "COORDINATOR", "Worker" -> "REGISTRATION_DESK")
 */
export function normalizeRoleKey(roleName: string): string {
  if (!roleName) return "";
  const upper = roleName.trim().toUpperCase();
  if (upper === "SUPER_ADMIN" || upper === "SUPER ADMIN")
    return ROLES.SUPER_ADMIN;
  if (
    upper === "CHURCH ADMIN" ||
    upper === "ADMIN" ||
    upper === "CHURCH_ADMIN"
  ) {
    return ROLES.ADMIN;
  }
  if (
    upper === "EVENT COORDINATOR" ||
    upper === "COORDINATOR" ||
    upper === "GAMES COORDINATOR" ||
    upper === "GAMES_COORDINATOR" ||
    upper === "LEADER" ||
    upper === "EVENT MANAGER"
  ) {
    return ROLES.COORDINATOR;
  }
  if (
    upper === "REGISTRATION DESK" ||
    upper === "REGISTRATION_DESK" ||
    upper === "WORKER" ||
    upper === "REGISTRATION & DESK" ||
    upper === "REGISTRATION AND DESK"
  ) {
    return ROLES.REGISTRATION_DESK;
  }
  if (upper === "MEMBER") {
    return "MEMBER";
  }
  return upper;
}

/**
 * Extracts normalized role keys from a user object.
 * Handles user.roles (string[]), user.userRoles (IUserRole[]), user.role (string).
 */
export function getUserRoles(user: IUser | null | undefined): string[] {
  if (!user) return [];

  const rolesSet = new Set<string>();

  // 1. Direct array of role strings (e.g. ['SUPER_ADMIN', 'ADMIN'])
  if (Array.isArray(user.roles)) {
    user.roles.forEach((r) => {
      if (typeof r === "string" && r.trim()) {
        const norm = normalizeRoleKey(r);
        if (norm) rolesSet.add(norm);
      }
    });
  }

  // 2. Direct single role string (e.g. 'ADMIN')
  if (typeof user.role === "string" && user.role.trim()) {
    const norm = normalizeRoleKey(user.role);
    if (norm) rolesSet.add(norm);
  }

  // 3. Array of userRole objects (e.g. [{ role: { name: 'SUPER_ADMIN' } }])
  if (Array.isArray(user.userRoles)) {
    user.userRoles.forEach((ur: unknown) => {
      if (!ur) return;
      const item = ur as Record<string, unknown>;
      const roleObj = item?.role as
        Record<string, unknown> | string | undefined;
      const roleName =
        (typeof ur === "string" ? ur : null) ||
        (typeof roleObj === "string" ? roleObj : null) ||
        (typeof roleObj === "object" && typeof roleObj?.name === "string"
          ? roleObj.name
          : null) ||
        (typeof roleObj === "object" && typeof roleObj?.key === "string"
          ? roleObj.key
          : null) ||
        (typeof item?.name === "string" ? item.name : null) ||
        (typeof item?.roleName === "string" ? item.roleName : null);
      if (roleName && typeof roleName === "string" && roleName.trim()) {
        const norm = normalizeRoleKey(roleName);
        if (norm) rolesSet.add(norm);
      }
    });
  }

  return Array.from(rolesSet);
}

/**
 * Checks if the user has authority based on allowed roles.
 */
export function hasAuthority(
  userRoles: string[],
  allowedRoles: string[],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;

  const normalizedUserRoles = userRoles.map(normalizeRoleKey);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRoleKey);

  // SUPER_ADMIN has access to everything
  if (normalizedUserRoles.includes(ROLES.SUPER_ADMIN)) return true;

  return normalizedAllowedRoles.some((role) =>
    normalizedUserRoles.includes(role),
  );
}

/**
 * Section 3: Recommended Landing Page Redirection Logic
 * Determines the default route for a user based on their roles or user object.
 */
export function getDefaultRouteForUser(
  rolesOrUser: string[] | IUser | null | undefined,
): string {
  const roles = Array.isArray(rolesOrUser)
    ? rolesOrUser
    : getUserRoles(rolesOrUser);
  const normalized = roles.map(normalizeRoleKey);
  if (
    normalized.includes(ROLES.SUPER_ADMIN) ||
    normalized.includes(ROLES.ADMIN)
  ) {
    return "/dashboard";
  }
  if (normalized.includes(ROLES.COORDINATOR)) {
    return "/events";
  }
  if (normalized.includes(ROLES.REGISTRATION_DESK)) {
    return "/attendance";
  }
  return "/events";
}
