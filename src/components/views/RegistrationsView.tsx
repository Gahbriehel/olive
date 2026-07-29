import React, { useState } from "react";
import { Search, Download, QrCode, Send, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Registration, Team } from "@/types/dashboard";

interface RegistrationsViewProps {
  registrations: Registration[];
  teams: Team[];
  onExportCsv: () => void;
  onReassignTeam: (registrationId: string, newTeamId: string) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  teams,
  onExportCsv,
  onReassignTeam,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [reassignModalTarget, setReassignModalTarget] =
    useState<Registration | null>(null);
  const [selectedNewTeamId, setSelectedNewTeamId] = useState("");

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesTeam = teamFilter === "All" || r.assignedTeamId === teamFilter;
    return matchesSearch && matchesStatus && matchesTeam;
  });

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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search by name, reg # (e.g. YC26-1001), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3.5 pl-5">Reg Number</th>
                <th className="p-3.5">Attendee Name</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Team</th>
                <th className="p-3.5">QR Ticket</th>
                <th className="p-3.5">Confirmation Email</th>
                <th className="p-3.5 text-right pr-5">Reassign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300">
              {filteredRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="p-3.5 pl-5 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {reg.registrationNumber}
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {reg.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{reg.email}</p>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        reg.status === "Checked-In" ? "emerald" : "indigo"
                      }
                      dot
                    >
                      {reg.status}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm inline-block"
                      style={{ backgroundColor: reg.assignedTeamColor }}
                    >
                      {reg.assignedTeamName}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {reg.qrGenerated ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <QrCode className="w-3.5 h-3.5" />
                        Generated
                      </span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {reg.confirmationSent ? (
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <Send className="w-3.5 h-3.5" />
                        Dispatched
                      </span>
                    ) : (
                      <span className="text-slate-400">Queued</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReassignModalTarget(reg);
                        setSelectedNewTeamId(reg.assignedTeamId);
                      }}
                      leftIcon={
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                      }
                    >
                      Change Team
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
