"use client";

import React, { useState, useMemo } from "react";
import { Building2, Plus, Users, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import {
  DepartmentForm,
  DepartmentFormValues,
} from "@/components/Forms/DepartmentForm";
import { useDepartments } from "@/hooks/useDepartments";
import { useListFilters } from "@/hooks/useListFilters";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, ROLES } from "@/utils/rbac";
import { IDepartment } from "@/models/department";
import { useDepartmentColumns } from "./_components/useDepartmentColumns";
import { DepartmentRosterDrawer } from "./_components/DepartmentRosterDrawer";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);
  const canManage = isSuperAdmin || userRoles.includes(ROLES.ADMIN);

  const { page, setPage, limit, setLimit, search, setSearch } = useListFilters({
    searchDebounceMs: 300,
  });

  const {
    departments: apiDepartments,
    isLoading,
    isError,
    error,
    refetch,
    createDepartment,
    isCreating,
    updateDepartment,
    isUpdating,
    deleteDepartment,
    isDeleting,
  } = useDepartments();

  const [selectedRosterDept, setSelectedRosterDept] =
    useState<IDepartment | null>(null);
  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingDept, setDeletingDept] = useState<IDepartment | null>(null);

  // Client-side filtering & pagination for department list
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return apiDepartments;
    const q = search.toLowerCase();
    return apiDepartments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q),
    );
  }, [apiDepartments, search]);

  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredDepartments.slice(start, start + limit);
  }, [filteredDepartments, page, limit]);

  const paginationMeta = useMemo(() => {
    const total = filteredDepartments.length;
    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }, [filteredDepartments.length, page, limit]);

  const totalMembersAssigned = useMemo(() => {
    return apiDepartments.reduce(
      (sum, d) => sum + (d._count?.members ?? d.members?.length ?? 0),
      0,
    );
  }, [apiDepartments]);

  const handleCreateSubmit = async (data: DepartmentFormValues) => {
    await createDepartment(data);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = async (data: DepartmentFormValues) => {
    if (!editingDept) return;
    await updateDepartment({ id: editingDept.id, dto: data });
    setEditingDept(null);
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    await deleteDepartment(deletingDept.id);
    setDeletingDept(null);
  };

  const columns = useDepartmentColumns({
    page,
    limit,
    canManage,
    onViewRoster: setSelectedRosterDept,
    onEdit: setEditingDept,
    onDelete: setDeletingDept,
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="Departments & Ministries"
        description="Oversee church ministries, active rosters, leadership assignments, and member moderation."
        icon={Building2}
      />

      {/* Stats Summary */}
      <StatsCardGroup>
        <StatsCard
          title="Total Departments"
          value={apiDepartments.length.toString()}
          change="Active units"
          trend="neutral"
          icon={Building2}
          color="indigo"
          loading={isLoading}
        />
        <StatsCard
          title="Assigned Personnel"
          value={totalMembersAssigned.toString()}
          change="Across all departments"
          trend="up"
          icon={Users}
          color="emerald"
          loading={isLoading}
        />
        <StatsCard
          title="Avg. Department Size"
          value={
            apiDepartments.length > 0
              ? Math.round(
                  totalMembersAssigned / apiDepartments.length,
                ).toString()
              : "0"
          }
          change="Members per ministry"
          trend="neutral"
          icon={Layers}
          color="cyan"
          loading={isLoading}
        />
      </StatsCardGroup>

      {/* Table adhering to architecture standards */}
      <Table
        columns={columns}
        data={paginatedDepartments}
        searchPlaceholder="Search departments by name or description..."
        enableSearch={true}
        enablePagination={true}
        defaultPageSize={10}
        emptyMessage="No departments found"
        meta={paginationMeta}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        search={search}
        onSearchChange={setSearch}
        loading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        resource="departments"
      >
        <ListToolbar
          create={{
            label: "Create Department",
            onClick: () => setIsCreateOpen(true),
            icon: <Plus className="w-4 h-4" />,
            show: canManage,
          }}
          actions={[{ title: "Refresh", fn: () => refetch() }]}
        />
      </Table>

      {/* Create Department Sidebar Modal */}
      <SidebarModal
        title="Create New Department"
        description="Add a ministry, unit, or service department to the church platform."
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <DepartmentForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isCreating}
        />
      </SidebarModal>

      {/* Edit Department Sidebar Modal */}
      <SidebarModal
        title="Edit Department"
        description={
          editingDept ? `Update details for ${editingDept.name}` : undefined
        }
        isOpen={Boolean(editingDept)}
        onClose={() => setEditingDept(null)}
      >
        {editingDept && (
          <DepartmentForm
            initialValues={editingDept}
            onSubmit={handleEditSubmit}
            onDelete={() => {
              setDeletingDept(editingDept);
              setEditingDept(null);
            }}
            onCancel={() => setEditingDept(null)}
            isLoading={isUpdating}
          />
        )}
      </SidebarModal>

      {/* Department Roster Drawer */}
      <DepartmentRosterDrawer
        departmentId={selectedRosterDept?.id || null}
        onClose={() => setSelectedRosterDept(null)}
        canManage={canManage}
      />

      {/* Delete Department Confirmation */}
      <ConfirmActionModal
        display={Boolean(deletingDept)}
        close={() => setDeletingDept(null)}
        fn={handleDelete}
        title="Delete Department"
        description={
          deletingDept
            ? `Are you sure you want to delete ${deletingDept.name}? This will remove department affiliations for assigned members.`
            : ""
        }
        confirmLabel="Delete Department"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}
