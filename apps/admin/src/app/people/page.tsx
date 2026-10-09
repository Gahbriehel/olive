"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  UserPlus,
  History,
  Users,
  Shield,
  UserCheck,
  Calendar,
  Edit,
} from "lucide-react";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { ActionsList } from "@/components/ui/ActionsList";
import { RegisterPersonForm } from "@/components/Forms/RegisterPersonForm";
import { PersonForm } from "@/components/Forms/PersonForm";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { customToast } from "@/helpers/customToast";
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
import { type FilterField } from "@/models/filters";

const peopleFilterFields: FilterField[] = [
  {
    type: "select",
    key: "membershipStatus",
    label: "Membership Status",
    allLabel: "All Statuses",
    options: [
      { label: "Member", value: "Member" },
      { label: "Worker", value: "Worker" },
      { label: "Leader", value: "Leader" },
      { label: "Visitor", value: "Visitor" },
    ],
  },
  {
    type: "select",
    key: "gender",
    label: "Gender",
    allLabel: "All Genders",
    options: [
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ],
  },
];

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
  const [drawerTab, setDrawerTab] = useState("info");
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
      customToast.success("Person updated successfully!");
    } catch (err) {
      console.error("Failed to update person:", err);
    }
  };

  const totalPeople = stats?.total ?? people.length;
  const totalMembers = stats?.membership?.members ?? 0;
  const totalVisitors = stats?.membership?.visitors ?? 0;
  const totalWorkers = stats?.membership?.workers ?? 0;

  const columns = useMemo<ColumnDef<IPerson>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) =>
          padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      },
      {
        accessorKey: "name",
        header: "Person",
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(person.name)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {capitalizeWords(person.name)}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Contact Info",
        cell: ({ row }) => (
          <div>
            <TruncatedTextWithCopy
              text={row.original.email}
              maxLength={28}
              textClassName="font-medium text-slate-900 dark:text-slate-200"
            />
            <p className="text-[11px] text-slate-400">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender / DOB",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.gender}</p>
            <p className="text-[11px] text-slate-400">
              DOB: {row.original.dob}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "membershipStatus",
        header: "Membership",
        cell: ({ row }) => (
          <StatusBadge status={row.original.membershipStatus} size="sm" />
        ),
      },
      {
        accessorKey: "registrationHistoryCount",
        header: "Events Registered",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {row.original.registrationHistoryCount} Events
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const person = row.original;
          const actions = [
            {
              title: "View Details",
              fn: () => {
                setSelectedPerson(person);
              },
            },
          ];

          if (isSuperAdmin) {
            actions.push({
              title: "Edit Person",
              fn: () => {
                setEditingPerson(person);
              },
            });
          }

          return <ActionsList actions={actions} />;
        },
      },
    ],
    [page, limit, isSuperAdmin],
  );

  const drawerTabs = [
    { id: "info", label: "Details" },
    {
      id: "departments",
      label: "Departments",
      count: selectedPerson?.departments?.length || 0,
    },
    {
      id: "attendance",
      label: "Attendance",
      count: selectedPerson?.attendanceHistory?.length || 0,
    },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          People Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Central repository of church members, conference attendees, and
          first-time guests.
        </p>
      </div>

      {/* Directory Stats Grid */}
      <StatsCardGroup>
        <StatsCard
          title="Total People"
          value={totalPeople.toLocaleString()}
          change="Directory total"
          trend="neutral"
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
        <StatsCard
          title="Church Members"
          value={totalMembers.toLocaleString()}
          change={`${totalPeople > 0 ? ((totalMembers / totalPeople) * 100).toFixed(0) : 0}% of total`}
          trend="up"
          icon={Shield}
          color="cyan"
          loading={isLoading}
        />
        <StatsCard
          title="Church Workers"
          value={totalWorkers.toLocaleString()}
          change=""
          trend="up"
          icon={Calendar}
          color="emerald"
          loading={isLoading}
        />
        <StatsCard
          title="Visitors & Guests"
          value={totalVisitors.toLocaleString()}
          change={`${totalPeople > 0 ? ((totalVisitors / totalPeople) * 100).toFixed(0) : 0}% of total`}
          trend="neutral"
          icon={UserCheck}
          color="amber"
          loading={isLoading}
        />
      </StatsCardGroup>

      {/* People TanStack Data Table */}
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

      {/* Person Details Sidebar Modal */}
      <SidebarModal
        display={!!selectedPerson}
        close={() => setSelectedPerson(null)}
        title={selectedPerson?.name || ""}
        subtitle={
          selectedPerson?.id
            ? `Member Profile • ID: ${selectedPerson.id}`
            : undefined
        }
      >
        {selectedPerson && (
          <div className="space-y-6">
            {/* Header Badge Card */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {getInitials(selectedPerson.name)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {selectedPerson.name}
                  </h3>
                  <StatusBadge
                    status={selectedPerson.membershipStatus}
                    size="sm"
                  />
                </div>
              </div>
              {isSuperAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => setEditingPerson(selectedPerson)}
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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

            {/* Details Tab */}
            {drawerTab === "info" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Phone Number
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.phone}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Email Address
                    </p>
                    <div className="mt-1">
                      <TruncatedTextWithCopy
                        text={selectedPerson.email}
                        maxLength={24}
                        textClassName="font-semibold text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Gender
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.gender}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Date of Birth
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedPerson.dob}
                    </p>
                  </div>
                  {selectedPerson.address && (
                    <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Address
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                        {selectedPerson.address}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-500" />
                    Registration History (
                    {selectedPerson.registrationHistoryCount || 0} Events)
                  </p>
                  {selectedPerson.registrations &&
                  selectedPerson.registrations.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {selectedPerson.registrations.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {reg.eventTitle}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {reg.eventDate} • Team: {reg.teamName}
                            </p>
                          </div>
                          <StatusBadge status={reg.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No event registrations recorded.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Departments Tab */}
            {drawerTab === "departments" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Church ministry department memberships:
                </p>
                {selectedPerson.departments &&
                selectedPerson.departments.length > 0 ? (
                  selectedPerson.departments.map((dept, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                    >
                      <span>{dept}</span>
                      <StatusBadge status="Active" size="sm" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                    No department assigned.
                  </div>
                )}
              </div>
            )}

            {drawerTab === "attendance" && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Historical event check-in log (
                  {selectedPerson.eventsAttendedCount || 0} Attended):
                </p>
                {selectedPerson.attendanceHistory &&
                selectedPerson.attendanceHistory.length > 0 ? (
                  selectedPerson.attendanceHistory.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {hist.eventName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {hist.date}
                        </p>
                      </div>
                      <StatusBadge
                        status={hist.attended ? "Checked In" : "Not Checked In"}
                        size="sm"
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                    No attendance records found.
                  </div>
                )}
              </div>
            )}

            {drawerTab === "notes" && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px]">
                  Administrator & Pastoral Notes:
                </p>
                {selectedPerson.notes ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 font-medium">
                    {selectedPerson.notes}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                    No notes recorded.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SidebarModal>

      {/* Add Person Sidebar Modal */}
      <SidebarModal
        title="Add New Person"
        display={isAddPersonOpen}
        close={() => setIsAddPersonOpen(false)}
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
        display={isRegisterOpen}
        close={() => setIsRegisterOpen(false)}
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
          display={!!editingPerson}
          close={() => setEditingPerson(null)}
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
