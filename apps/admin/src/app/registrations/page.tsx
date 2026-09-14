"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Download, Users, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Select } from "@/components/FormElements/Select";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { getInitials } from "@/utils/formatters";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { exportToCsv } from "@/helpers/exportCsv";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { IRegistration } from "@/types/dashboard";

export default function RegistrationsPage() {
  const { selectedEventId } = useDashboard();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [teamId, setTeamId] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRegistration, setSelectedRegistration] =
    useState<IRegistration | null>(null);

  const regParams = useMemo(
    () => ({
      eventId: selectedEventId,
      page,
      limit,
      search: search || undefined,
      status: status !== "All" ? status : undefined,
      teamId: teamId !== "All" ? teamId : undefined,
    }),
    [selectedEventId, page, limit, search, status, teamId],
  );

  const {
    registrations: apiRegistrations,
    meta,
    refetch,
    isLoading,
  } = useRegistrations(regParams);
  const { teams: apiTeams } = useTeams(selectedEventId);

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const registrations = useMemo(
    () =>
      Array.isArray(apiRegistrations)
        ? apiRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiRegistrations],
  );

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

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleTeamChange = (newTeamId: string) => {
    setTeamId(newTeamId);
    setPage(1);
  };

  const totalReg = meta?.total ?? registrations.length;

  const columns = useMemo<ColumnDef<IRegistration>[]>(
    () => [
      {
        id: "s/n",
        header: "S/N",
        accessorFn: (_, rowIndex) =>
          padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      },
      {
        accessorKey: "registrationNumber",
        header: "Reg Number",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
            {row.original.registrationNumber}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Attendee Name",
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {row.original.name}
            </p>
            <TruncatedTextWithCopy
              text={row.original.email}
              maxLength={28}
              textClassName="text-[11px] text-slate-400"
            />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "assignedTeamName",
        header: "Assigned Team",
        accessorFn: (row) => row.team?.name,
        cell: ({ row }) => (
          <span
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm inline-block"
            style={{ backgroundColor: row.original.team?.color }}
          >
            {row.original.team?.name}
          </span>
        ),
      },
      {
        id: "confirmationSent",
        header: "Confirmation Email",
        accessorFn: (row) => row.person?.emailStatus || "PENDING",
        cell: ({ row }) => (
          <StatusBadge status={row.original.person?.emailStatus || "PENDING"} />
        ),
      },
      {
        id: "googleCalendarSync",
        header: "Calendar Sync",
        accessorFn: (row) => row.googleCalendarSync ?? false,
        cell: ({ row }) =>
          row.original.googleCalendarSync ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              Opted In
            </span>
          ) : (
            <span className="text-slate-400">Off</span>
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ActionsList
              actions={[
                {
                  title: "View Details",
                  fn: () => {
                    setSelectedRegistration(row.original);
                  },
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [page, limit],
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Registrations Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time roster of confirmed registrants, QR ticket dispatches, and
            assigned tournament teams.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <RefreshButton onRefetch={refetch} />
          <Button
            variant="primary"
            onClick={() => exportToCsv(registrations)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV Roster
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registrations"
          value={totalReg.toLocaleString()}
          change=""
          trend="neutral"
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:w-44">
          <Select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={teamId}
            onChange={(e) => handleTeamChange(e.target.value)}
          >
            <option value="All">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        data={registrations}
        searchPlaceholder="Search by name, reg # (e.g. YC26-1001), or email..."
        enableSearch={true}
        enablePagination={true}
        defaultPageSize={10}
        emptyMessage="No registrations found"
        meta={meta}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={handleLimitChange}
        search={search}
        onSearchChange={handleSearchChange}
        loading={isLoading}
      />

      {/* Registration Details Sidebar Modal */}
      <SidebarModal
        display={!!selectedRegistration}
        close={() => setSelectedRegistration(null)}
        title="Registration Details"
      >
        {selectedRegistration && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-[-1rem] mb-2">
              Registration Code:{" "}
              <span className="font-mono font-semibold">
                {selectedRegistration.registrationNumber}
              </span>
            </p>

            {/* Header Badge Card */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {getInitials(selectedRegistration.name)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {selectedRegistration.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedRegistration.email}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedRegistration.status} />
            </div>

            {/* Info Sections */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Attendee & Team Profile
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Gender
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRegistration.gender}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Membership Status
                  </p>
                  <StatusBadge
                    status={selectedRegistration.membershipStatus}
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Phone Number
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRegistration.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Assigned Team
                  </p>
                  {selectedRegistration.team ? (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm inline-block"
                      style={{
                        backgroundColor: selectedRegistration.team.color,
                      }}
                    >
                      {selectedRegistration.team.name}
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Registration Details
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Registered At
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRegistration.registeredAt}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Confirmation Email
                  </p>
                  <StatusBadge
                    status={
                      selectedRegistration.person?.emailStatus || "PENDING"
                    }
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 mb-1">
                    Calendar Sync
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRegistration.googleCalendarSync
                      ? "Opted In"
                      : "Off"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarModal>
    </div>
  );
}
