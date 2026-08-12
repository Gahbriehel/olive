"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority } from "@/utils/rbac";

export interface AuthorityGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthorityGuard: React.FC<AuthorityGuardProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();
  const userRoles = getUserRoles(user);

  const isAllowed = hasAuthority(userRoles, roles);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthorityGuard;
