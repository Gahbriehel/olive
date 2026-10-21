"use client";

import React, { useMemo } from "react";
import {
  Users,
  UserCheck,
  Clock,
  MessageSquare,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { type FilterValues } from "@/models/filters";
import { type IPeopleStats } from "@/models/person";

export type PeopleTabId =
  "all" | "visitors" | "pending" | "in_progress" | "converted" | "care_queue";

interface PeopleDirectoryTabsProps {
  filters: FilterValues;
  onFilterChange: (nextFilters: FilterValues) => void;
  stats?: IPeopleStats;
  totalItems?: number;
}

/**
 * Determines which directory or care tab is currently active based on applied filters.
 */
export function getActivePeopleTab(
  filters: FilterValues,
): PeopleTabId | "custom" {
  const { membershipStatus, followUpStatus, hasPendingCheckIn } = filters;

  if (hasPendingCheckIn === "true") {
    return "care_queue";
  }
  if (membershipStatus === "VISITOR" && followUpStatus === "IN_PROGRESS") {
    return "in_progress";
  }
  if (followUpStatus === "PENDING" && !membershipStatus) {
    return "pending";
  }
  if (followUpStatus === "CONVERTED" && !membershipStatus) {
    return "converted";
  }
  if (membershipStatus === "VISITOR" && !followUpStatus) {
    return "visitors";
  }
  if (!membershipStatus && !followUpStatus && !hasPendingCheckIn) {
    return "all";
  }
  return "custom";
}

/**
 * Resolves the query filters to send for a chosen tab per the Integration Guide:
 * - All Visitors: GET /people?membershipStatus=VISITOR
 * - Pending Contact: GET /people?followUpStatus=PENDING (visitors awaiting first contact)
 * - In Progress: GET /people?membershipStatus=VISITOR&followUpStatus=IN_PROGRESS
 * - Converted: GET /people?followUpStatus=CONVERTED
 * - Care Queue: GET /people?hasPendingCheckIn=true (scheduled pastoral care)
 * - All People: clears membershipStatus, followUpStatus, and hasPendingCheckIn
 */
export function getFiltersForPeopleTab(
  tabId: PeopleTabId,
  currentFilters: FilterValues,
): FilterValues {
  const next: FilterValues = { ...currentFilters };

  delete next.hasPendingCheckIn;

  if (tabId === "all") {
    delete next.membershipStatus;
    delete next.followUpStatus;
  } else if (tabId === "visitors") {
    next.membershipStatus = "VISITOR";
    delete next.followUpStatus;
  } else if (tabId === "pending") {
    delete next.membershipStatus;
    next.followUpStatus = "PENDING";
  } else if (tabId === "in_progress") {
    next.membershipStatus = "VISITOR";
    next.followUpStatus = "IN_PROGRESS";
  } else if (tabId === "converted") {
    delete next.membershipStatus;
    next.followUpStatus = "CONVERTED";
  } else if (tabId === "care_queue") {
    delete next.membershipStatus;
    delete next.followUpStatus;
    next.hasPendingCheckIn = "true";
  }

  return next;
}

/**
 * Filter tabs for People & Visitor directory supporting the complete visitor lifecycle.
 */
export function PeopleDirectoryTabs({
  filters,
  onFilterChange,
  stats,
  totalItems,
}: PeopleDirectoryTabsProps) {
  const activeTab = useMemo(() => getActivePeopleTab(filters), [filters]);

  const tabs = useMemo<TabItem[]>(() => {
    return [
      {
        id: "all",
        label: "All People",
        icon: <Users className="w-3.5 h-3.5" />,
        count: stats?.total ?? (activeTab === "all" ? totalItems : undefined),
      },
      {
        id: "visitors",
        label: "All Visitors",
        icon: <UserCheck className="w-3.5 h-3.5" />,
        count:
          stats?.membership?.visitors ??
          (activeTab === "visitors" ? totalItems : undefined),
      },
      {
        id: "pending",
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
        count: activeTab === "pending" ? totalItems : undefined,
      },
      {
        id: "in_progress",
        label: "In Progress",
        icon: <MessageSquare className="w-3.5 h-3.5" />,
        count: activeTab === "in_progress" ? totalItems : undefined,
      },
      {
        id: "converted",
        label: "Converted",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        count: activeTab === "converted" ? totalItems : undefined,
      },
      {
        id: "care_queue",
        label: "Care Queue",
        icon: <HeartHandshake className="w-3.5 h-3.5" />,
        count: activeTab === "care_queue" ? totalItems : undefined,
      },
    ];
  }, [stats, activeTab, totalItems]);

  const handleTabChange = (tabId: string) => {
    const nextFilters = getFiltersForPeopleTab(tabId as PeopleTabId, filters);
    onFilterChange(nextFilters);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Tabs
        tabs={tabs}
        activeTab={activeTab === "custom" ? "" : activeTab}
        onChange={handleTabChange}
        label="People & Visitor Follow-up views"
      />
      {activeTab === "custom" && (
        <span className="text-2xs text-fg-muted font-medium italic">
          Custom filter applied
        </span>
      )}
    </div>
  );
}
