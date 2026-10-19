import { useState } from "react";
import { Edit, ArrowUpRight, MessageSquare } from "lucide-react";
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

  return (
    <SidebarModal
      isOpen={!!person}
      onClose={onClose}
      title={person?.name || ""}
      description={person?.id ? `Member Profile • ID: ${person.id}` : undefined}
    >
      {person && (
        <div className="space-y-6">
          {/* Header Badge Card */}
          <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center shrink-0">
                {getInitials(person.name)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-fg">{person.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={person.membershipStatus} size="sm" />
                  {person.followUpStatus && (
                    <StatusBadge status={person.followUpStatus} size="sm" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onFollowUp && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs font-semibold"
                  onClick={() => onFollowUp(person)}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary-text" />
                  <span>Follow-up</span>
                </Button>
              )}
              {canPromote &&
                onPromote &&
                person.rawMembershipStatus !== "PASTOR" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs font-semibold"
                    onClick={() => onPromote(person)}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-primary-text" />
                    <span>Promote</span>
                  </Button>
                )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs font-semibold"
                  onClick={() => onEdit(person)}
                >
                  <Edit
                    className="w-3.5 h-3.5 text-primary-text"
                    aria-hidden="true"
                  />
                  <span>Edit</span>
                </Button>
              )}
            </div>
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
