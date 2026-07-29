"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { PeopleView } from "@/components/views/PeopleView";

export default function PeoplePage() {
  const { people } = useDashboard();
  return <PeopleView people={people} />;
}
