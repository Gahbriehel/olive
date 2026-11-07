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
  // Coordinators may create and edit departments, but not delete them or
  // manage rosters; those stay with admins (`canManage`).
  const canCreateOrEdit = canManage || userRoles.includes(ROLES.COORDINATOR);

  const { page, setPage, limit, setLimit, search, setSearch, queryParams } =
    useListFilters({
      searchDebounceMs: 300,
    });

  const {
    departments: apiDepartments,
    meta,
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
  } = useDepartments(queryParams);

  const [selectedRosterDept, setSelectedRosterDept] =
    useState<IDepartment | null>(null);
  const [editingDept, setEditingDept] = useState<IDepartment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingDept, setDeletingDept] = useState<IDepartment | null>(null);

  // Pagination and search are server-side; `meta` describes the full result set.
  const totalDepartments = meta?.total ?? apiDepartments.length;
  const paginationMeta = useMemo(
    () => ({
      total: totalDepartments,
      page: meta?.page ?? page,
      limit: meta?.limit ?? limit,
      totalPages: Math.max(1, meta?.totalPages ?? 1),
    }),
    [meta, totalDepartments, page, limit],
  );

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
    canEdit: canCreateOrEdit,
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
        actions={
          <ListToolbar
            create={{
              label: "Create Department",
              onClick: () => setIsCreateOpen(true),
              icon: <Plus className="w-4 h-4" />,
              show: canCreateOrEdit,
            }}
            actions={[{ title: "Refresh", fn: () => refetch() }]}
          />
        }
      />

      {/* Stats Summary */}
      <StatsCardGroup>
        <StatsCard
          title="Total Departments"
          value={totalDepartments.toString()}
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
        data={apiDepartments}
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
        onRowClick={setSelectedRosterDept}
      />

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
            onDelete={
              canManage
                ? () => {
                    setDeletingDept(editingDept);
                    setEditingDept(null);
                  }
                : undefined
            }
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
