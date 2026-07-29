"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { UsersView } from "@/components/views/UsersView";

export default function UsersPage() {
  const { adminUsers } = useDashboard();
  return <UsersView users={adminUsers} />;
}
