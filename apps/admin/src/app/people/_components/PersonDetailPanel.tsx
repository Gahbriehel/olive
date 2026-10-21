"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { getInitials } from "@/utils/formatters";
import { IPerson } from "@/models/person";
import { IPastoralCheckIn } from "@/models/checkIn";
import { usePerson } from "@/hooks/usePeople";
import {
  PersonAttendanceTab,
  PersonDepartmentsTab,
  PersonInfoTab,
  PersonNotesTab,
} from "./PersonDetailTabs";
import { PersonPastoralCareTab } from "./PersonPastoralCareTab";

interface PersonDetailPanelProps {
  person: IPerson | null;
  onClose: () => void;
  /** Only passed for users allowed to edit people. */
  onEdit?: (person: IPerson) => void;
  onLogCheckIn?: (person: IPerson) => void;
  onScheduleCare?: (person: IPerson) => void;
  onCompleteCheckIn?: (checkIn: IPastoralCheckIn) => void;
  onCancelCheckIn?: (checkInId: string) => void;
}

/** Read-only person profile in the side panel, with sub-tabs. */
export function PersonDetailPanel({
  person,
  onClose,
  onEdit,
  onLogCheckIn,
  onScheduleCare,
  onCompleteCheckIn,
  onCancelCheckIn,
}: PersonDetailPanelProps) {
  const [drawerTab, setDrawerTab] = useState("info");

  // Fetch complete person profile (GET /people/:id) which includes full pastoralCheckIns history
  const { data: fullPersonData, isLoading: isLoadingFullPerson } = usePerson(
    person?.id,
    person?.raw,
  );

  const isVisitor =
    person?.rawMembershipStatus === "VISITOR" ||
    person?.membershipStatus === "Visitor";

  const checkIns =
    fullPersonData?.pastoralCheckIns || person?.pastoralCheckIns || [];
  const hasPendingCare =
    fullPersonData?.hasPendingCheckIn ??
    person?.hasPendingCheckIn ??
    checkIns.some((c) => c.status === "SCHEDULED");
  const lastCheckInAt = fullPersonData?.lastCheckInAt ?? person?.lastCheckInAt;

  const drawerTabs = [
    { id: "info", label: "Details" },
    {
      id: "pastoralCare",
      label: "Pastoral Care",
      count: checkIns.length,
    },
    {
      id: "departments",
      label: "Departments",
      count: person?.departments?.length || 0,
    },
    {
      id: "attendance",
      label: "Attendance",
      count: person?.attendanceHistory?.length || 0,
    },
    { id: "notes", label: "Notes" },
  ];

  return (
    <DetailDrawer
      isOpen={!!person}
      onClose={onClose}
      title={person?.name || ""}
      action={
        person && onEdit ? (
          <Button type="button" onClick={() => onEdit(person)}>
            Edit
          </Button>
        ) : undefined
      }
    >
      {person && (
        <div className="space-y-6">
          {/* Header Profile Card */}
          <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(person.name)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-fg truncate">
                  {person.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge status={person.membershipStatus} size="sm" />
                  {isVisitor && (
                    <StatusBadge
                      status={person.followUpStatus || "PENDING"}
                      size="sm"
                    />
                  )}
                  {hasPendingCare && (
                    <Badge variant="amber" size="sm" dot>
                      Care Scheduled
                    </Badge>
                  )}
                  {!hasPendingCare && lastCheckInAt && (
                    <span className="text-2xs text-fg-muted font-medium">
                      Last Care: {new Date(lastCheckInAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Sub-Tabs */}
          <Tabs
            tabs={drawerTabs}
            activeTab={drawerTab}
            onChange={setDrawerTab}
          />

          {drawerTab === "info" && <PersonInfoTab person={person} />}
          {drawerTab === "pastoralCare" && (
            <PersonPastoralCareTab
              person={person}
              checkIns={checkIns}
              isLoading={isLoadingFullPerson}
              onLogCheckIn={() => onLogCheckIn?.(person)}
              onScheduleCare={() => onScheduleCare?.(person)}
              onCompleteCheckIn={(task) => onCompleteCheckIn?.(task)}
              onCancelCheckIn={(id) => onCancelCheckIn?.(id)}
            />
          )}
          {drawerTab === "departments" && (
            <PersonDepartmentsTab person={person} />
          )}
          {drawerTab === "attendance" && (
            <PersonAttendanceTab person={person} />
          )}
          {drawerTab === "notes" && <PersonNotesTab person={person} />}
        </div>
      )}
    </DetailDrawer>
  );
}
