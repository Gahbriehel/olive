"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { getInitials } from "@/utils/formatters";
import { IPerson } from "@/models/person";
import {
  PersonAttendanceTab,
  PersonDepartmentsTab,
  PersonInfoTab,
  PersonNotesTab,
} from "./PersonDetailTabs";

interface PersonDetailPanelProps {
  person: IPerson | null;
  onClose: () => void;
  /** Only passed for users allowed to edit people. */
  onEdit?: (person: IPerson) => void;
  canPromote?: boolean;
  onPromote?: (person: IPerson) => void;
  onFollowUp?: (person: IPerson) => void;
}

/** Read-only person profile in the side panel, with sub-tabs. */
export function PersonDetailPanel({
  person,
  onClose,
  onEdit,
  canPromote = false,
  onPromote,
  onFollowUp,
}: PersonDetailPanelProps) {
  const [drawerTab, setDrawerTab] = useState("info");

  const drawerTabs = [
    { id: "info", label: "Details" },
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

  const isVisitor =
    person?.rawMembershipStatus === "VISITOR" ||
    person?.membershipStatus === "Visitor";

  return (
    <SidebarModal
      isOpen={!!person}
      onClose={onClose}
      title={person?.name || ""}
      footer={
        person ? (
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              {onFollowUp && isVisitor && (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => onFollowUp(person)}
                >
                  Follow-up
                </Button>
              )}
              {canPromote &&
                onPromote &&
                person.rawMembershipStatus !== "PASTOR" && (
                  <Button
                    size="sm"
                    variant="primary"
                    type="button"
                    onClick={() => onPromote(person)}
                  >
                    {isVisitor ? "Promote to Member" : "Promote Person"}
                  </Button>
                )}
            </div>
          </div>
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
                </div>
              </div>
            </div>

            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0"
                onClick={() => onEdit(person)}
              >
                <Edit className="w-3.5 h-3.5 text-fg-muted" />
                <span>Edit</span>
              </Button>
            )}
          </div>

          {/* Drawer Sub-Tabs */}
          <Tabs
            tabs={drawerTabs}
            activeTab={drawerTab}
            onChange={setDrawerTab}
          />

          {drawerTab === "info" && <PersonInfoTab person={person} />}
          {drawerTab === "departments" && (
            <PersonDepartmentsTab person={person} />
          )}
          {drawerTab === "attendance" && (
            <PersonAttendanceTab person={person} />
          )}
          {drawerTab === "notes" && <PersonNotesTab person={person} />}
        </div>
      )}
    </SidebarModal>
  );
}
