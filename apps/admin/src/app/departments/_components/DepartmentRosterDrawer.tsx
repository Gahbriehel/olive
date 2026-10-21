"use client";

import React, { useState } from "react";
import {
  UserPlus,
  UserMinus,
  Shield,
  Users,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, SkeletonList } from "@/components/ui/QueryState";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { IDepartmentMember } from "@/models/department";
import { useDepartment, useDepartments } from "@/hooks/useDepartments";
import { getInitials } from "@/utils/formatters";
import {
  DepartmentMemberForm,
  DepartmentMemberFormValues,
} from "@/components/Forms/DepartmentMemberForm";

interface DepartmentRosterDrawerProps {
  departmentId: string | null;
  onClose: () => void;
  canManage?: boolean;
}

export const DepartmentRosterDrawer: React.FC<DepartmentRosterDrawerProps> = ({
  departmentId,
  onClose,
  canManage = false,
}) => {
  const { data: department, isLoading } = useDepartment(
    departmentId || undefined,
  );
  const { addMember, removeMember, isAddingMember, isRemovingMember } =
    useDepartments();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] =
    useState<IDepartmentMember | null>(null);

  const handleAddMember = async (data: DepartmentMemberFormValues) => {
    if (!departmentId) return;
    await addMember({ departmentId, dto: data });
    setIsAddOpen(false);
  };

  const handleRemoveMember = async () => {
    if (!departmentId || !memberToRemove) return;
    await removeMember({
      departmentId,
      personId: memberToRemove.person.id,
    });
    setMemberToRemove(null);
  };

  const members = department?.members || [];
  const memberCount = department?._count?.members ?? members.length;

  return (
    <>
      <DetailDrawer
        isOpen={Boolean(departmentId)}
        onClose={onClose}
        title={department?.name || "Department Details"}
        description={
          department
            ? `${memberCount} ${memberCount === 1 ? "Member" : "Members"} Assigned`
            : undefined
        }
      >
        {isLoading ? (
          <SkeletonList rows={5} className="p-4" />
        ) : department ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-fg flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {department.name}
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary-text">
                  {memberCount} Active
                </span>
              </div>
              {department.description ? (
                <p className="text-xs text-fg-muted">
                  {department.description}
                </p>
              ) : (
                <p className="text-xs text-fg-muted italic">
                  No description provided
                </p>
              )}
            </div>

            {/* Roster Section Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-fg uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Active Roster ({members.length})
              </h4>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => setIsAddOpen(true)}
                >
                  <UserPlus className="w-3.5 h-3.5 text-primary-text" />
                  <span>Add Member</span>
                </Button>
              )}
            </div>

            {/* Members Roster List */}
            {members.length > 0 ? (
              <div className="space-y-2.5">
                {members.map((membership) => {
                  const person = membership.person;
                  const fullName =
                    `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
                    "Unknown";
                  return (
                    <div
                      key={membership.id || person.id}
                      className="p-3.5 rounded-xl bg-subtle border border-border flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs text-fg truncate">
                              {fullName}
                            </p>
                            <StatusBadge
                              status={membership.role || "Member"}
                              size="sm"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-2xs text-fg-muted">
                            {person.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-fg-subtle" />
                                <span className="truncate">{person.email}</span>
                              </span>
                            )}
                            {person.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-fg-subtle" />
                                <span>{person.phone}</span>
                              </span>
                            )}
                            {membership.joinedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-fg-subtle" />
                                <span>
                                  Joined{" "}
                                  {new Date(
                                    membership.joinedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:text-danger hover:bg-danger-soft p-1.5 h-auto shrink-0"
                          title="Remove from Department"
                          onClick={() => setMemberToRemove(membership)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No members in this department yet"
                description="Assign members or let church congregation workers enroll in this ministry."
                action={
                  canManage ? (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAddOpen(true)}
                    >
                      Assign First Member
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        ) : null}
      </DetailDrawer>

      {/* Add Member Sidebar Modal */}
      <SidebarModal
        title="Assign Member"
        description={
          department ? `Assign a member to ${department.name}` : undefined
        }
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      >
        {department && (
          <DepartmentMemberForm
            department={department}
            onSubmit={handleAddMember}
            onCancel={() => setIsAddOpen(false)}
            isLoading={isAddingMember}
          />
        )}
      </SidebarModal>

      {/* Remove Member Confirmation Modal */}
      <ConfirmActionModal
        display={Boolean(memberToRemove)}
        close={() => setMemberToRemove(null)}
        fn={handleRemoveMember}
        title="Remove Member from Department"
        description={
          memberToRemove
            ? `Are you sure you want to remove ${memberToRemove.person.firstName} ${memberToRemove.person.lastName} from ${department?.name}? They can be re-assigned at any time.`
            : ""
        }
        confirmLabel="Remove Member"
        tone="danger"
        loading={isRemovingMember}
      />
    </>
  );
};
