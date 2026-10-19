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
import { PromotePersonModal } from "./_components/PromotePersonModal";
import {
  FollowUpForm,
  FollowUpFormValues,
} from "@/components/Forms/FollowUpForm";
import { ApiMembershipStatus } from "@/models/person";

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
  const [promotingPerson, setPromotingPerson] = useState<IPerson | null>(null);
  const [followUpPerson, setFollowUpPerson] = useState<IPerson | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);
  const canPromote = isSuperAdmin || userRoles.includes(ROLES.ADMIN);

  const {
    people: apiPeople,
    meta,
    stats,
    createPerson,
    isCreating,
    updatePerson,
    isUpdating,
    promotePerson,
    isPromoting,
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

  const handlePromotePerson = async (
    id: string,
    membershipStatus: ApiMembershipStatus,
  ) => {
    try {
      const updated = await promotePerson({ id, membershipStatus });
      setPromotingPerson(null);
      if (selectedPerson?.id === id && updated) {
        setSelectedPerson(adaptApiPersonToPerson(updated));
      }
    } catch (err) {
      console.error("Failed to promote person:", err);
    }
  };

  const handleFollowUpSubmit = async (
    id: string,
    payload: FollowUpFormValues,
  ) => {
    try {
      const dateIso = payload.lastFollowUpAt
        ? new Date(payload.lastFollowUpAt).toISOString()
        : new Date().toISOString();

      const updated = await updatePerson({
        id,
        dto: {
          followUpStatus: payload.followUpStatus,
          followUpNotes: payload.followUpNotes,
          lastFollowUpAt: dateIso,
        },
      });
      setFollowUpPerson(null);
      if (selectedPerson?.id === id && updated) {
        setSelectedPerson(adaptApiPersonToPerson(updated));
      }
    } catch (err) {
      console.error("Failed to update follow-up:", err);
    }
  };

  const columns = usePeopleColumns({
    page,
    limit,
    isSuperAdmin,
    canPromote,
    onView: setSelectedPerson,
    onEdit: setEditingPerson,
    onPromote: setPromotingPerson,
    onFollowUp: setFollowUpPerson,
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="People Directory"
        description="Central repository of church members, visitors, and ministry leaders with pastoral tracking."
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
        canPromote={canPromote}
        onPromote={setPromotingPerson}
        onFollowUp={setFollowUpPerson}
      />

      {/* Promote Person Modal */}
      <PromotePersonModal
        person={promotingPerson}
        isOpen={Boolean(promotingPerson)}
        onClose={() => setPromotingPerson(null)}
        onPromote={handlePromotePerson}
        isLoading={isPromoting}
      />

      {/* Pastoral Follow-up Sidebar Modal */}
      <SidebarModal
        title="Pastoral Follow-up"
        description={
          followUpPerson
            ? `Log pastoral care and visitor touchpoint for ${followUpPerson.name}`
            : undefined
        }
        isOpen={Boolean(followUpPerson)}
        onClose={() => setFollowUpPerson(null)}
      >
        {followUpPerson && (
          <FollowUpForm
            person={followUpPerson}
            onSubmit={(data) => handleFollowUpSubmit(followUpPerson.id, data)}
            onCancel={() => setFollowUpPerson(null)}
            isLoading={isUpdating}
          />
        )}
      </SidebarModal>

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
