"use client";

import React, { useState, useMemo } from "react";
import { UserPlus, LayoutGrid, List } from "lucide-react";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { RegisterPersonForm } from "@/components/Forms/RegisterPersonForm";
import { PersonForm } from "@/components/Forms/PersonForm";
import {
  LogCheckInForm,
  ImmediateLogCheckInFormValues,
} from "@/components/Forms/LogCheckInForm";
import {
  ScheduleCareForm,
  ScheduleCareCheckInFormValues,
} from "@/components/Forms/ScheduleCareForm";
import { CompleteCheckInModal } from "@/components/modals/CompleteCheckInModal";
import { GlobalCheckInQueue } from "./_components/GlobalCheckInQueue";
import { usePeople } from "@/hooks/usePeople";
import { useCheckIns } from "@/hooks/useCheckIns";
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
import { IPastoralCheckIn } from "@/models/checkIn";
import { peopleService } from "@/services/people.service";
import { IRegistrationPayload } from "@/models/registration";
import { peopleFilterFields } from "./_components/peopleFilters";
import { PeopleStats } from "./_components/PeopleStats";
import { PersonDetailPanel } from "./_components/PersonDetailPanel";
import { usePeopleColumns } from "./_components/usePeopleColumns";
import { PromotePersonModal } from "./_components/PromotePersonModal";
import { PeopleDirectoryTabs } from "./_components/PeopleDirectoryTabs";
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
    filters,
    applyFilters,
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
  const [logCheckInPerson, setLogCheckInPerson] = useState<IPerson | null>(
    null,
  );
  const [scheduleCarePerson, setScheduleCarePerson] = useState<IPerson | null>(
    null,
  );
  const [completingCheckIn, setCompletingCheckIn] =
    useState<IPastoralCheckIn | null>(null);
  const [careViewMode, setCareViewMode] = useState<"tasks" | "table">("tasks");
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

  const {
    createCheckIn,
    isCreating: isCreatingCheckIn,
    completeCheckIn,
    isCompleting: isCompletingCheckIn,
    cancelCheckIn,
  } = useCheckIns();

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

  const handleLogCheckInSubmit = async (
    data: ImmediateLogCheckInFormValues,
  ) => {
    if (!logCheckInPerson) return;
    try {
      await createCheckIn({
        personId: logCheckInPerson.id,
        reason: data.reason,
        status: "COMPLETED",
        notes: data.notes,
        outcome: data.outcome,
      });
      setLogCheckInPerson(null);
      refetch();
    } catch (err) {
      console.error("Failed to log check-in:", err);
    }
  };

  const handleScheduleCareSubmit = async (
    data: ScheduleCareCheckInFormValues,
  ) => {
    if (!scheduleCarePerson) return;
    try {
      await createCheckIn({
        personId: scheduleCarePerson.id,
        reason: data.reason,
        status: "SCHEDULED",
        assignedToId: data.assignedToId || undefined,
        scheduledFor: data.scheduledFor
          ? new Date(data.scheduledFor).toISOString()
          : undefined,
        notes: data.notes,
      });
      setScheduleCarePerson(null);
      refetch();
    } catch (err) {
      console.error("Failed to schedule care:", err);
    }
  };

  const handleCompleteCheckIn = async (checkInId: string, outcome: string) => {
    try {
      await completeCheckIn({ id: checkInId, outcome });
      setCompletingCheckIn(null);
      refetch();
    } catch (err) {
      console.error("Failed to complete check-in:", err);
    }
  };

  const handleCancelCheckIn = async (checkInId: string) => {
    try {
      await cancelCheckIn(checkInId);
      refetch();
    } catch (err) {
      console.error("Failed to cancel check-in:", err);
    }
  };

  const handleSelectPersonById = async (personId: string) => {
    const existing = people.find((p) => p.id === personId);
    if (existing) {
      setSelectedPerson(existing);
      return;
    }
    try {
      const fetched = await peopleService.getPersonById(personId);
      if (fetched) {
        setSelectedPerson(adaptApiPersonToPerson(fetched));
      }
    } catch (err) {
      console.error("Failed to load person details:", err);
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
    onLogCheckIn: setLogCheckInPerson,
    onScheduleCare: setScheduleCarePerson,
  });

  const isCareQueueActive = filters.hasPendingCheckIn === "true";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title="People Directory"
        description="Central repository of church members, visitors, and ministry leaders with pastoral care and touchpoint history."
      />

      <PeopleStats
        totalPeople={stats?.total ?? people.length}
        totalMembers={stats?.membership?.members ?? 0}
        totalWorkers={stats?.membership?.workers ?? 0}
        totalVisitors={stats?.membership?.visitors ?? 0}
        loading={isLoading}
      />

      <PeopleDirectoryTabs
        filters={filters}
        onFilterChange={applyFilters}
        stats={stats}
        totalItems={meta?.total}
      />

      {/* When in Care Queue view, allow toggling between outreach task cards and table */}
      {isCareQueueActive && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-subtle border border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-fg">
              Pastoral Care View:
            </span>
            <span className="text-2xs text-fg-muted hidden sm:inline">
              Switch between pending outreach task cards and the people
              directory
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant={careViewMode === "tasks" ? "primary" : "outline"}
              className="text-xs h-8 gap-1.5"
              onClick={() => setCareViewMode("tasks")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Outreach Tasks</span>
            </Button>
            <Button
              size="sm"
              variant={careViewMode === "table" ? "primary" : "outline"}
              className="text-xs h-8 gap-1.5"
              onClick={() => setCareViewMode("table")}
            >
              <List className="w-3.5 h-3.5" />
              <span>Directory Table</span>
            </Button>
          </div>
        </div>
      )}

      {isCareQueueActive && careViewMode === "tasks" ? (
        <GlobalCheckInQueue
          onCompleteTask={setCompletingCheckIn}
          onCancelTask={handleCancelCheckIn}
          onSelectPersonById={handleSelectPersonById}
        />
      ) : (
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
          onRowClick={setSelectedPerson}
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
      )}

      <FiltersModal {...panelProps} />

      {/* Person Detail Drawer */}
      <PersonDetailPanel
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onEdit={isSuperAdmin ? setEditingPerson : undefined}
        canPromote={canPromote}
        onPromote={setPromotingPerson}
        onFollowUp={setFollowUpPerson}
        onLogCheckIn={setLogCheckInPerson}
        onScheduleCare={setScheduleCarePerson}
        onCompleteCheckIn={setCompletingCheckIn}
        onCancelCheckIn={handleCancelCheckIn}
      />

      {/* Promote Person Modal */}
      <PromotePersonModal
        person={promotingPerson}
        isOpen={Boolean(promotingPerson)}
        onClose={() => setPromotingPerson(null)}
        onPromote={handlePromotePerson}
        isLoading={isPromoting}
      />

      {/* Log Pastoral Check-in Sidebar Modal (Immediate Log) */}
      <SidebarModal
        title="Log Pastoral Check-in"
        description={
          logCheckInPerson
            ? `Record completed outreach touchpoint for ${logCheckInPerson.name}`
            : undefined
        }
        isOpen={Boolean(logCheckInPerson)}
        onClose={() => setLogCheckInPerson(null)}
      >
        {logCheckInPerson && (
          <LogCheckInForm
            person={logCheckInPerson}
            onSubmit={handleLogCheckInSubmit}
            onCancel={() => setLogCheckInPerson(null)}
            isLoading={isCreatingCheckIn}
          />
        )}
      </SidebarModal>

      {/* Flag for Care / Schedule Outreach Sidebar Modal (Delegated Task) */}
      <SidebarModal
        title="Flag for Care & Schedule Outreach"
        description={
          scheduleCarePerson
            ? `Schedule an outreach task for ${scheduleCarePerson.name}`
            : undefined
        }
        isOpen={Boolean(scheduleCarePerson)}
        onClose={() => setScheduleCarePerson(null)}
      >
        {scheduleCarePerson && (
          <ScheduleCareForm
            person={scheduleCarePerson}
            onSubmit={handleScheduleCareSubmit}
            onCancel={() => setScheduleCarePerson(null)}
            isLoading={isCreatingCheckIn}
          />
        )}
      </SidebarModal>

      {/* Complete Scheduled Check-in Modal */}
      <CompleteCheckInModal
        checkIn={completingCheckIn}
        isOpen={Boolean(completingCheckIn)}
        onClose={() => setCompletingCheckIn(null)}
        onComplete={handleCompleteCheckIn}
        isLoading={isCompletingCheckIn}
      />

      {/* Visitor Follow-up Sidebar Modal */}
      <SidebarModal
        title="Visitor Follow-up"
        description={
          followUpPerson
            ? `Log visitor outreach touchpoint for ${followUpPerson.name}`
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
