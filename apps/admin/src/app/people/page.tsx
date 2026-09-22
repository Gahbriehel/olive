"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  UserPlus,
  History,
  Users,
  Shield,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Select } from "@/components/FormElements/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ActionsList } from "@/components/ui/ActionsList";
import { RegisterPersonForm } from "@/components/Forms/RegisterPersonForm";
import { AddPersonForm } from "@/components/Forms/AddPersonForm";
import { getInitials, capitalizeWords } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { usePeople } from "@/hooks/usePeople";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import {
  adaptApiPersonToPerson,
  IPerson,
  IPersonPayload,
} from "@/models/person";
import { IRegistrationPayload } from "@/models/registration";

export default function PeoplePage() {
  const [search, setSearch] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("All");
  const [gender, setGender] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [drawerTab, setDrawerTab] = useState("info");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      membershipStatus:
        membershipStatus !== "All" ? membershipStatus : undefined,
      gender: gender !== "All" ? gender : undefined,
    }),
    [page, limit, search, membershipStatus, gender],
  );

  const {
    people: apiPeople,
    meta,
    stats,
    createPerson,
    isCreating,
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

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleMembershipChange = (newStatus: string) => {
    setMembershipStatus(newStatus);
    setPage(1);
  };

  const handleGenderChange = (newGender: string) => {
    setGender(newGender);
    setPage(1);
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
        cell: ({ row }) => (
          <ActionsList
            actions={[
              {
                title: "View Details",

                fn: () => {
                  setSelectedPerson(row.original);
                },
              },
            ]}
          />
        ),
      },
    ],
    [page, limit],
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            People Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Central repository of church members, conference attendees, and
            first-time guests.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <RefreshButton onRefetch={refetch} />
            <ExportCsvButton
              endpoint="/people/export"
              params={{
                search: search || undefined,
                membershipStatus:
                  membershipStatus !== "All" ? membershipStatus : undefined,
                gender: gender !== "All" ? gender : undefined,
              }}
              fallbackFilename={`people-${new Date().toISOString().slice(0, 10)}.csv`}
            />
            <Button
              variant="outline"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsAddPersonOpen(true)}
            >
              Add Person
            </Button>
            <Button
              variant="primary"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => setIsRegisterOpen(true)}
            >
              Register Person for Event
            </Button>
          </div>
        </div>
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

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:w-44">
          <Select
            value={membershipStatus}
            onChange={(e) => handleMembershipChange(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Member">Member</option>
            <option value="Worker">Worker</option>
            <option value="Leader">Leader</option>
            <option value="Visitor">Visitor</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={gender}
            onChange={(e) => handleGenderChange(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        </div>
      </div>

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
        onLimitChange={handleLimitChange}
        search={search}
        onSearchChange={handleSearchChange}
        loading={isLoading}
      />

      {/* Person Details Sidebar Modal */}
      <SidebarModal
        display={!!selectedPerson}
        close={() => setSelectedPerson(null)}
        title={selectedPerson?.name || ""}
      >
        {selectedPerson && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-[-1rem] mb-2">
              Member Profile • ID: {selectedPerson?.id || ""}
            </p>
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
        <AddPersonForm
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
    </div>
  );
}
