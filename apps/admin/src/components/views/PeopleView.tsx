import React, { useState } from "react";
import {
  UserPlus,
  History,
  Users,
  Shield,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Select } from "@/components/FormElements/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { Tabs } from "@/components/ui/Tabs";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { RegisterPersonForm } from "@/components/Forms/RegisterPersonForm";
import { AddPersonForm } from "@/components/Forms/AddPersonForm";
import { IRegistrationPayload } from "@/models/registration";
import { IPerson, IPersonPayload } from "@/models/person";
import { getPeopleColumns } from "./people/people-columns";
import { getInitials } from "@/utils/formatters";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";

interface PeopleViewProps {
  people: IPerson[];
  events?: { id: string; title: string }[];
  onRegisterPerson?: (
    eventId: string,
    payload: IRegistrationPayload,
  ) => void | Promise<void>;
  isRegistering?: boolean;
  onAddPerson?: (payload: IPersonPayload) => void | Promise<void>;
  isAddingPerson?: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  membershipFilter?: string;
  onMembershipFilterChange?: (membership: string) => void;
  genderFilter?: string;
  onGenderFilterChange?: (gender: string) => void;
  onRefetch?: () => void;
  isLoading?: boolean;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  events = [],
  onRegisterPerson,
  isRegistering = false,
  onAddPerson,
  isAddingPerson = false,
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
  membershipFilter = "All",
  onMembershipFilterChange,
  genderFilter = "All",
  onGenderFilterChange,
  onRefetch,
  isLoading = false,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [drawerTab, setDrawerTab] = useState("info");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  // Calculate dynamic stats from people
  const totalPeople = meta?.total ?? people.length;
  const totalMembers = people.filter(
    (p) => p.membershipStatus === "Member",
  ).length;
  const totalVisitors = people.filter(
    (p) => p.membershipStatus === "Visitor",
  ).length;
  const activeAttendees = people.filter(
    (p) => p.registrationHistoryCount > 0,
  ).length;

  const columns = React.useMemo(
    () => getPeopleColumns({ onSelectPerson: setSelectedPerson }),
    [],
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
            <RefreshButton onRefetch={onRefetch} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Visitors & Guests"
          value={totalVisitors.toLocaleString()}
          change={`${totalPeople > 0 ? ((totalVisitors / totalPeople) * 100).toFixed(0) : 0}% of total`}
          trend="neutral"
          icon={UserCheck}
          color="amber"
          loading={isLoading}
        />
        <StatsCard
          title="Active Attendees"
          value={activeAttendees.toLocaleString()}
          change="Attended 1+ events"
          trend="up"
          icon={Calendar}
          color="emerald"
          loading={isLoading}
        />
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:w-44">
          <Select
            value={membershipFilter}
            onChange={(e) =>
              onMembershipFilterChange &&
              onMembershipFilterChange(e.target.value)
            }
          >
            <option value="All">All Statuses</option>
            <option value="Member">Member</option>
            <option value="Visitor">Visitor</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={genderFilter}
            onChange={(e) =>
              onGenderFilterChange && onGenderFilterChange(e.target.value)
            }
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
        onPageChange={onPageChange}
        limit={limit}
        onLimitChange={onLimitChange}
        search={search}
        onSearchChange={onSearchChange}
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
          onSubmit={async (payload) => {
            if (onAddPerson) {
              await onAddPerson(payload);
            }
            setIsAddPersonOpen(false);
          }}
          onCancel={() => setIsAddPersonOpen(false)}
          isLoading={isAddingPerson}
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
          onSubmit={async (eventId, payload) => {
            if (onRegisterPerson) {
              await onRegisterPerson(eventId, payload);
            }
            setIsRegisterOpen(false);
          }}
          onCancel={() => setIsRegisterOpen(false)}
          isLoading={isRegistering}
        />
      </SidebarModal>
    </div>
  );
};
