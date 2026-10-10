"use client";

import React, { useState, useMemo } from "react";
import { UserPlus } from "lucide-react";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { RegisterPersonForm } from "@/components/Forms/RegisterPersonForm";
import { PersonForm } from "@/components/Forms/PersonForm";
import { usePeople } from "@/hooks/usePeople";
import { useListFilters } from "@/hooks/useListFilters";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, ROLES } from "@/utils/rbac";
import {
  adaptApiPersonToPerson,
  IPerson,
  IPersonPayload,
  IUpdatePersonPayload,
} from "@/models/person";
import { IRegistrationPayload } from "@/models/registration";
import { peopleFilterFields } from "./_components/peopleFilters";
import { PeopleStats } from "./_components/PeopleStats";
import { PersonDetailPanel } from "./_components/PersonDetailPanel";
import { usePeopleColumns } from "./_components/usePeopleColumns";

export default function PeoplePage() {
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    activeCount,
    queryParams,
    exportParams,
    openPanel,
    panelProps,
  } = useListFilters({ fields: peopleFilterFields });

  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<IPerson | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  const {
    people: apiPeople,
    meta,
    stats,
    createPerson,
    isCreating,
    updatePerson,
    isUpdating,
    refetch,
    isLoading,
    isError,
    error,
  } = usePeople(queryParams);
  const { events: apiEvents } = useEvents();
  const { registerAttendee, isRegistering } = useRegistrations();

  const people = useMemo(
    () =>
      Array.isArray(apiPeople) ? apiPeople.map(adaptApiPersonToPerson) : [],
    [apiPeople],
  );

  const events = useMemo(
    () =>
      Array.isArray(apiEvents)
        ? apiEvents.map((e) => ({ id: e.id, title: e.title }))
        : [],
    [apiEvents],
  );

  const handleRegisterPerson = async (
    eventId: string,
    payload: IRegistrationPayload,
  ) => {
    await registerAttendee({ eventId, dto: payload });
    setIsRegisterOpen(false);
  };

  const handleAddPerson = async (payload: IPersonPayload) => {
    await createPerson(payload);
    setIsAddPersonOpen(false);
  };

  const handleEditPerson = async (payload: IUpdatePersonPayload) => {
    if (!editingPerson || !isSuperAdmin) return;
    try {
      const updated = await updatePerson({
        id: editingPerson.id,
        dto: payload,
      });
      setEditingPerson(null);
      if (selectedPerson?.id === editingPerson.id && updated) {
        setSelectedPerson(adaptApiPersonToPerson(updated));
      }
    } catch (err) {
      console.error("Failed to update person:", err);
    }
  };

  const columns = usePeopleColumns({
    page,
    limit,
    isSuperAdmin,
    onView: setSelectedPerson,
    onEdit: setEditingPerson,
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="People Directory"
        description="Central repository of church members, conference attendees, and first-time guests."
      />

      <PeopleStats
        totalPeople={stats?.total ?? people.length}
        totalMembers={stats?.membership?.members ?? 0}
        totalWorkers={stats?.membership?.workers ?? 0}
        totalVisitors={stats?.membership?.visitors ?? 0}
        loading={isLoading}
      />

      <Table
        columns={columns}
        data={people}
        searchPlaceholder="Search by name, email, or phone"
        enableSearch={true}
        enablePagination={true}
        defaultPageSize={10}
        emptyMessage="No people match your search criteria"
        meta={meta}
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
        resource="people"
      >
        <ListToolbar
          create={{
            label: "Add Person",
            onClick: () => setIsAddPersonOpen(true),
            icon: <UserPlus className="w-4 h-4" />,
          }}
          actions={[
            { title: "Refresh", fn: () => refetch() },
            {
              title: "Export CSV",
              fn: () =>
                downloadCsvExport(
                  "/people/export",
                  exportParams,
                  `people-${new Date().toISOString().slice(0, 10)}.csv`,
                ),
            },
            {
              title: "Register Person for Event",
              fn: () => setIsRegisterOpen(true),
            },
          ]}
          trailing={
            <FiltersButton onClick={openPanel} activeCount={activeCount} />
          }
        />
      </Table>

      <FiltersModal {...panelProps} />

      <PersonDetailPanel
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onEdit={isSuperAdmin ? setEditingPerson : undefined}
      />

      {/* Add Person Sidebar Modal */}
      <SidebarModal
        title="Add New Person"
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
      >
        <PersonForm
          onSubmit={handleAddPerson}
          onCancel={() => setIsAddPersonOpen(false)}
          isLoading={isCreating}
        />
      </SidebarModal>

      {/* Register Person Sidebar Modal */}
      <SidebarModal
        title="Register Person for Event"
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      >
        <RegisterPersonForm
          events={events}
          onSubmit={handleRegisterPerson}
          onCancel={() => setIsRegisterOpen(false)}
          isLoading={isRegistering}
        />
      </SidebarModal>

      {/* Edit Person Sidebar Modal - Only for Super Admin */}
      {isSuperAdmin && (
        <SidebarModal
          title="Edit Person"
          isOpen={!!editingPerson}
          onClose={() => setEditingPerson(null)}
        >
          {editingPerson && (
            <PersonForm
              key={editingPerson.id}
              initialValues={editingPerson}
              onSubmit={handleEditPerson}
              onCancel={() => setEditingPerson(null)}
              isLoading={isUpdating}
            />
          )}
        </SidebarModal>
      )}
    </div>
  );
}
