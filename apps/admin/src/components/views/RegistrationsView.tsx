import React, { useState } from "react";
import { Download, Users, UserCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Select } from "@/components/FormElements/Select";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { IRegistration, ITeam } from "@/types/dashboard";
import { ColumnDef } from "@tanstack/react-table";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getInitials } from "@/utils/formatters";

interface RegistrationsViewProps {
  registrations: IRegistration[];
  teams: ITeam[];
  onExportCsv: () => void;
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
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  teamFilter?: string;
  onTeamFilterChange?: (teamId: string) => void;
  onRefetch?: () => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  teams,
  onExportCsv,
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
  statusFilter = "All",
  onStatusFilterChange,
  teamFilter = "All",
  onTeamFilterChange,
  onRefetch,
}) => {
  const [selectedRegistration, setSelectedRegistration] =
    useState<IRegistration | null>(null);

  const totalReg = meta?.total ?? registrations.length;
  const checkedIn = registrations.filter(
    (r) => r.status === "Checked-In",
  ).length;

  const columns: ColumnDef<IRegistration>[] = [
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
      accessorKey: "assignedTeamName",
      header: "Assigned Team",
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
      accessorKey: "confirmationSent",
      header: "Confirmation Email",
      cell: ({ row }) => (
        <StatusBadge status={row.original.person?.emailStatus || "PENDING"} />
      ),
    },
    {
      accessorKey: "googleCalendarSync",
      header: "Calendar Sync",
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
  ];

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
          <RefreshButton onRefetch={onRefetch} />
          <Button
            variant="primary"
            onClick={onExportCsv}
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
        />
        <StatsCard
          title="Checked-In Today"
          value={checkedIn.toLocaleString()}
          change={`${totalReg > 0 ? ((checkedIn / totalReg) * 100).toFixed(0) : 0}% check-in rate`}
          trend="up"
          icon={UserCheck}
          color="emerald"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange && onStatusFilterChange(e.target.value)
            }
          >
            <option value="All">All Statuses</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={teamFilter}
            onChange={(e) =>
              onTeamFilterChange && onTeamFilterChange(e.target.value)
            }
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
        onPageChange={onPageChange}
        limit={limit}
        onLimitChange={onLimitChange}
        search={search}
        onSearchChange={onSearchChange}
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
};
