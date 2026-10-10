"use client";

import { useState, useMemo } from "react";
import { Users, Calendar, Mail } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { StatsCard, StatsCardGroup } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { ActionsList } from "@/components/ui/ActionsList";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { getInitials } from "@/utils/formatters";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { IRegistration } from "@/types/dashboard";
import { TeamBadge } from "@/components/ui/TeamBadge";
import { RegistrantsEmailComposer } from "./_components/RegistrantsEmailComposer";

export default function RegistrationsPage() {
  const { selectedEventId, activeEvent } = useDashboard();
  const [selectedRegistration, setSelectedRegistration] =
    useState<IRegistration | null>(null);

  const { user } = useAuth();
  const canExport = hasAuthority(getUserRoles(user), [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.REGISTRATION_DESK,
  ]);

  // Email composer state; the composer owns its own form and selection.
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<IRegistration | null>(
    null,
  );

  const { teams: apiTeams } = useTeams(selectedEventId);

  const teams = useMemo(
    () => (Array.isArray(apiTeams) ? apiTeams.map(adaptApiTeamToTeam) : []),
    [apiTeams],
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: [
          { label: "Checked-In", value: "CHECKED_IN" },
          { label: "Confirmed", value: "CONFIRMED" },
          { label: "Cancelled", value: "CANCELLED" },
        ],
      },
      {
        type: "select",
        key: "teamId",
        label: "Team",
        allLabel: "All Teams",
        options: teams.map((t) => ({ label: t.name, value: t.id })),
      },
    ],
    [teams],
  );

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
  } = useListFilters({ fields: filterFields });

  const regParams = useMemo(
    () => ({ ...queryParams, eventId: selectedEventId }),
    [queryParams, selectedEventId],
  );

  const {
    registrations: apiRegistrations,
    meta,
    refetch,
    isLoading,
    isError,
    error,
  } = useRegistrations(regParams);

  const registrations = useMemo(
    () =>
      Array.isArray(apiRegistrations)
        ? apiRegistrations.map(adaptApiRegistrationToRegistration)
        : [],
    [apiRegistrations],
  );

  const totalReg = meta?.total ?? registrations.length;

  const handleOpenEmailModal = () => {
    setEmailRecipient(null);
    setIsEmailModalOpen(true);
  };

  const handleOpenEmailModalForRegistrant = (reg: IRegistration) => {
    setEmailRecipient(reg);
    setIsEmailModalOpen(true);
  };

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
          <span className="font-mono font-bold text-fg">
            {row.original.registrationNumber}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Attendee Name",
        cell: ({ row }) => (
          <div>
            <p className="font-bold text-fg">{row.original.name}</p>
            <TruncatedTextWithCopy
              text={row.original.email}
              maxLength={28}
              textClassName="text-2xs text-fg-muted"
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
          <TeamBadge color={row.original.team?.color}>
            {row.original.team?.name}
          </TeamBadge>
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
            <span className="flex items-center gap-1.5 text-success-text font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              Opted In
            </span>
          ) : (
            <span className="text-fg-muted">Off</span>
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
                {
                  title: "Send Email",
                  fn: () => {
                    handleOpenEmailModalForRegistrant(row.original);
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
      <PageHeader
        title="Registrations Manager"
        description="Real-time roster of confirmed registrants, QR ticket dispatches, and assigned tournament teams."
      />

      {/* Metrics Grid */}
      <StatsCardGroup>
        <StatsCard
          title="Total Registrations"
          value={totalReg.toLocaleString()}
          change=""
          trend="neutral"
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
      </StatsCardGroup>

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
        onLimitChange={setLimit}
        search={search}
        onSearchChange={setSearch}
        loading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        resource="registrations"
      >
        <ListToolbar
          create={{
            label: "Send Email",
            onClick: handleOpenEmailModal,
            icon: <Mail className="w-4 h-4" />,
          }}
          actions={[
            { title: "Refresh", fn: () => refetch() },
            ...(canExport
              ? [
                  {
                    title: "Export CSV",
                    fn: () =>
                      downloadCsvExport(
                        "/registrations/export",
                        {
                          eventId: selectedEventId || undefined,
                          ...exportParams,
                        },
                        `registrations-${new Date().toISOString().slice(0, 10)}.csv`,
                      ),
                  },
                ]
              : []),
          ]}
          trailing={
            <FiltersButton onClick={openPanel} activeCount={activeCount} />
          }
        />
      </Table>

      <FiltersModal {...panelProps} />

      {/* Compose Batch Email Sidebar Modal */}
      <SidebarModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Send Email to Registrants"
      >
        <RegistrantsEmailComposer
          initialRecipient={emailRecipient}
          eventId={selectedEventId || undefined}
          eventName={activeEvent?.title || activeEvent?.name}
          filters={{
            status: queryParams.status,
            teamId: queryParams.teamId,
            search,
          }}
          matchingCount={totalReg}
          reliableMatchingCount={meta?.total}
          loadedRegistrations={registrations}
          onCancel={() => setIsEmailModalOpen(false)}
          onSent={() => setIsEmailModalOpen(false)}
        />
      </SidebarModal>

      {/* Registration Details Sidebar Modal */}
      <SidebarModal
        isOpen={!!selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        title="Registration Details"
        description={
          selectedRegistration?.registrationNumber
            ? `Registration Code: ${selectedRegistration.registrationNumber}`
            : undefined
        }
      >
        {selectedRegistration && (
          <div className="space-y-6">
            {/* Header Badge Card */}
            <div className="p-4 rounded-2xl bg-primary-soft border border-primary-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center">
                  {getInitials(selectedRegistration.name)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-fg">
                    {selectedRegistration.name}
                  </h3>
                  <p className="text-xs text-fg-muted">
                    {selectedRegistration.email}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedRegistration.status} />
            </div>

            {/* Info Sections */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-fg border-b border-border pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-text" />
                Attendee & Team Profile
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-fg-subtle mb-1">Gender</p>
                  <p className="font-semibold text-fg">
                    {selectedRegistration.gender}
                  </p>
                </div>
                <div>
                  <p className="text-fg-subtle mb-1">Membership Status</p>
                  <StatusBadge
                    status={selectedRegistration.membershipStatus}
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-fg-subtle mb-1">Phone Number</p>
                  <p className="font-semibold text-fg">
                    {selectedRegistration.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-fg-subtle mb-1">Assigned Team</p>
                  {selectedRegistration.team ? (
                    <TeamBadge color={selectedRegistration.team.color}>
                      {selectedRegistration.team.name}
                    </TeamBadge>
                  ) : (
                    <span className="text-fg-muted">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-fg border-b border-border pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-text" />
                Registration Details
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-fg-subtle mb-1">Registered At</p>
                  <p className="font-semibold text-fg">
                    {selectedRegistration.registeredAt}
                  </p>
                </div>
                <div>
                  <p className="text-fg-subtle mb-1">Confirmation Email</p>
                  <StatusBadge
                    status={
                      selectedRegistration.person?.emailStatus || "PENDING"
                    }
                    size="sm"
                  />
                </div>
                <div>
                  <p className="text-fg-subtle mb-1">Calendar Sync</p>
                  <p className="font-semibold text-fg">
                    {selectedRegistration.googleCalendarSync
                      ? "Opted In"
                      : "Off"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action to Email this Attendee from Details View */}
            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full !h-10"
                onClick={() => {
                  const reg = selectedRegistration;
                  setSelectedRegistration(null);
                  handleOpenEmailModalForRegistrant(reg);
                }}
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send Email to Attendee
              </Button>
            </div>
          </div>
        )}
      </SidebarModal>
    </div>
  );
}
