import React, { useState } from "react";
import {
  Download,
  QrCode,
  Send,
  RefreshCw,
  Users,
  UserCheck,
  Shield,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { Registration, Team } from "@/types/dashboard";
import { ColumnDef } from "@tanstack/react-table";

interface RegistrationsViewProps {
  registrations: Registration[];
  teams: Team[];
  onExportCsv: () => void;
  onReassignTeam: (registrationId: string, newTeamId: string) => void;
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
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  teams,
  onExportCsv,
  onReassignTeam,
  meta,
  page,
  onPageChange,
  limit,
  onLimitChange,
  search,
  onSearchChange,
}) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [reassignModalTarget, setReassignModalTarget] =
    useState<Registration | null>(null);
  const [selectedNewTeamId, setSelectedNewTeamId] = useState("");

  const totalReg = registrations.length;
  const checkedIn = registrations.filter(
    (r) => r.status === "Checked-In",
  ).length;
  const assignedTeams = registrations.filter((r) => r.assignedTeamId).length;
  const confirmedSent = registrations.filter((r) => r.confirmationSent).length;

  const filteredRegistrations = registrations.filter((r) => {
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesTeam = teamFilter === "All" || r.assignedTeamId === teamFilter;
    return matchesStatus && matchesTeam;
  });

  const columns: ColumnDef<Registration>[] = [
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
          <p className="text-[11px] text-slate-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "Checked-In" ? "emerald" : "indigo"}
          dot
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "assignedTeamName",
      header: "Assigned Team",
      cell: ({ row }) => (
        <span
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm inline-block"
          style={{ backgroundColor: row.original.assignedTeamColor }}
        >
          {row.original.assignedTeamName}
        </span>
      ),
    },
    {
      accessorKey: "qrGenerated",
      header: "QR Ticket",
      cell: ({ row }) =>
        row.original.qrGenerated ? (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <QrCode className="w-3.5 h-3.5" />
            Generated
          </span>
        ) : (
          <span className="text-slate-400">Pending</span>
        ),
    },
    {
      accessorKey: "confirmationSent",
      header: "Confirmation Email",
      cell: ({ row }) =>
        row.original.confirmationSent ? (
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Send className="w-3.5 h-3.5" />
            Dispatched
          </span>
        ) : (
          <span className="text-slate-400">Queued</span>
        ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Reassign</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReassignModalTarget(row.original);
              setSelectedNewTeamId(row.original.assignedTeamId);
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-500" />}
          >
            Change Team
          </Button>
        </div>
      ),
    },
  ];

  const handleConfirmReassign = () => {
    if (reassignModalTarget && selectedNewTeamId) {
      onReassignTeam(reassignModalTarget.id, selectedNewTeamId);
      setReassignModalTarget(null);
    }
  };

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
        <Button
          variant="primary"
          onClick={onExportCsv}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV Roster
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registrations"
          value={totalReg.toLocaleString()}
          change="Event total roster"
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
        <StatsCard
          title="Team Assignments"
          value={assignedTeams.toLocaleString()}
          change="Balanced to 4 teams"
          trend="neutral"
          icon={Shield}
          color="cyan"
        />
        <StatsCard
          title="Email Confirmation"
          value={confirmedSent.toLocaleString()}
          change="QR tickets sent"
          trend="up"
          icon={Mail}
          color="amber"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            onChange={(e) => setTeamFilter(e.target.value)}
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
        data={filteredRegistrations}
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

      {/* Reassign Team Modal */}
      <Modal
        isOpen={!!reassignModalTarget}
        onClose={() => setReassignModalTarget(null)}
        title="Reassign Attendee Team"
        description={`Transfer ${reassignModalTarget?.name} (${reassignModalTarget?.registrationNumber}) to a different event team.`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Target Team
            </label>
            <div className="grid grid-cols-2 gap-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedNewTeamId(t.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedNewTeamId === t.id
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {t.name}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: t.colorHex }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setReassignModalTarget(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReassign}>
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
