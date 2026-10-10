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
}

/** Read-only person profile in the side panel, with sub-tabs. */
export function PersonDetailPanel({
  person,
  onClose,
  onEdit,
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
          <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center">
                {getInitials(person.name)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-fg">{person.name}</h3>
                <StatusBadge status={person.membershipStatus} size="sm" />
              </div>
            </div>
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => onEdit(person)}
              >
                <Edit
                  className="w-3.5 h-3.5 text-primary-text"
                  aria-hidden="true"
                />
                <span>Edit Profile</span>
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
