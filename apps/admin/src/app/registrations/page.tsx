"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Users,
  Calendar,
  Mail,
  Send,
  X,
  Sparkles,
  Upload,
  Trash2,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Switch } from "@/components/FormElements/Switch";
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
import { customToast } from "@/helpers/customToast";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useRegistrationsSelectQuery } from "@/hooks/useRegistrationsSelect";
import { useTeams } from "@/hooks/useTeams";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { IRegistration } from "@/types/dashboard";
import { type ISelect } from "@/components/ui/Select";
import {
  emailService,
  ISendBatchRegistrantsEmailPayload,
} from "@/services/email.service";
import { uploadsService } from "@/services/uploads.service";
import { Spinner } from "@/components/ui/Spinner";
import { TeamBadge } from "@/components/ui/TeamBadge";

interface EmailFormValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass: boolean;
  imageUrl?: string;
}

const transformRegistrationToSelect = (reg: IRegistration): ISelect => ({
  value: {
    _id: reg.id,
    registration: reg,
    email: reg.email,
    registrationNumber: reg.registrationNumber,
  },
  label: `${reg.name} (${reg.registrationNumber})`,
});

export default function RegistrationsPage() {
  const { selectedEventId } = useDashboard();
  const [selectedRegistration, setSelectedRegistration] =
    useState<IRegistration | null>(null);

  const { user } = useAuth();
  const canExport = hasAuthority(getUserRoles(user), [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.REGISTRATION_DESK,
  ]);

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendToAllRegistrants, setSendToAllRegistrants] = useState(true);
  const [selectedRegistrants, setSelectedRegistrants] = useState<
    Record<string, IRegistration>
  >({});

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

  // Selected registrants helpers
  const selectedRegistrantList = useMemo(
    () => Object.values(selectedRegistrants),
    [selectedRegistrants],
  );
  const selectedRegistrantIds = useMemo(
    () => Object.keys(selectedRegistrants),
    [selectedRegistrants],
  );
  const multiSelectValue = useMemo(
    () => selectedRegistrantList.map(transformRegistrationToSelect),
    [selectedRegistrantList],
  );

  const handleMultiSelectChange = useCallback(
    (newValues: ISelect[]) => {
      const next: Record<string, IRegistration> = {};
      newValues.forEach((item) => {
        const regId = item.value._id;
        if (!regId) return;

        const reg =
          item.value.registration ||
          selectedRegistrants[regId] ||
          registrations.find((r) => r.id === regId) ||
          ({
            id: regId,
            registrationNumber: item.value.registrationNumber || "",
            name: item.label.split(" (")[0] || item.label,
            email: item.value.email || "",
          } as unknown as IRegistration);

        next[regId] = reg;
      });
      setSelectedRegistrants(next);
    },
    [registrations, selectedRegistrants],
  );

  const removeRecipient = useCallback((regId: string) => {
    setSelectedRegistrants((prev) => {
      const next = { ...prev };
      delete next[regId];
      return next;
    });
  }, []);

  // Form handling
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<EmailFormValues>({
    defaultValues: {
      subject: "",
      heading: "",
      message: "",
      ctaLabel: "",
      ctaUrl: "",
      includeQrPass: false,
      imageUrl: "",
    },
  });

  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  // eslint-disable-next-line react-hooks/incompatible-library
  const flyerImageUrl = watch("imageUrl");

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingFlyer(true);
      const uploadedUrl = await uploadsService.uploadFlyer(file);
      setValue("imageUrl", uploadedUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch {
      // Handled by toast interceptor
    } finally {
      setIsUploadingFlyer(false);
    }
  };

  const handleOpenEmailModal = () => {
    setSendToAllRegistrants(true);
    setSelectedRegistrants({});
    setIsEmailModalOpen(true);
  };

  const handleOpenEmailModalForRegistrant = (reg: IRegistration) => {
    setSendToAllRegistrants(false);
    setSelectedRegistrants({ [reg.id]: reg });
    setIsEmailModalOpen(true);
  };

  const onEmailSubmit = async (formData: EmailFormValues) => {
    if (!sendToAllRegistrants && selectedRegistrantIds.length === 0) {
      customToast.error(
        "Please select at least one recipient or enable 'Send to all registrants'.",
      );
      return;
    }

    try {
      setIsSendingEmail(true);
      const payload: ISendBatchRegistrantsEmailPayload = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        heading: formData.heading?.trim() || undefined,
        ctaLabel: formData.ctaLabel?.trim() || undefined,
        ctaUrl: formData.ctaUrl?.trim() || undefined,
        includeQrPass: formData.includeQrPass,
        imageUrl: formData.imageUrl?.trim() || undefined,
      };

      if (sendToAllRegistrants) {
        if (selectedEventId) {
          payload.eventId = selectedEventId;
        }
        payload.status = queryParams.status as
          ISendBatchRegistrantsEmailPayload["status"] | undefined;
        payload.teamId = queryParams.teamId;
        payload.search = search.trim() || undefined;
      } else {
        payload.registrationIds = selectedRegistrantIds;
        if (selectedEventId) {
          payload.eventId = selectedEventId;
        }
      }

      await emailService.sendBatchRegistrantsEmail(payload);
      reset();
      setSelectedRegistrants({});
      setIsEmailModalOpen(false);
    } catch {
      // Handled by apiClient response interceptor
    } finally {
      setIsSendingEmail(false);
    }
  };

  const insertPlaceholder = (tag: string) => {
    const curSubject = getValues("subject") || "";
    setValue("subject", curSubject ? `${curSubject} ${tag}` : tag, {
      shouldValidate: true,
    });
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
        <form
          onSubmit={handleSubmit(onEmailSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Recipient Scope Switch */}
          <Switch
            checked={sendToAllRegistrants}
            onChange={(checked) => {
              setSendToAllRegistrants(checked);
            }}
            label="Send to all registrants for this event"
            description={
              sendToAllRegistrants
                ? "Broadcasting to all registered attendees for this event"
                : "Select specific attendees using the MultiSelect below"
            }
            color="indigo"
          />

          {/* All Registrants Notice */}
          {sendToAllRegistrants ? (
            <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary-border text-xs text-fg flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Users className="w-4 h-4 text-primary-text shrink-0" />
                <span>Target: All Event Registrants</span>
              </div>
              <p className="text-2xs text-fg-secondary">
                Email will be sent to all matching registrants (
                {totalReg.toLocaleString()} attendees)
                {queryParams.status && ` with status: ${queryParams.status}`}
                {queryParams.teamId && " for selected team"}.
              </p>
            </div>
          ) : (
            /* MultiSelect for Specific Registrants */
            <div className="flex flex-col gap-2">
              <MultiSelect
                label="Recipients"
                placeholder="Search & select attendees by name or reg #..."
                value={multiSelectValue}
                onChange={handleMultiSelectChange}
                queryHook={useRegistrationsSelectQuery}
                dataKey="items"
                transformData={(item: IRegistration) => ({
                  value: {
                    _id: item.id,
                    registration: item,
                    email: item.email,
                    registrationNumber: item.registrationNumber,
                  },
                  label: `${item.name} (${item.registrationNumber})`,
                })}
              />

              {/* Selected Recipients Chips */}
              {selectedRegistrantList.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-fg-muted">
                    <span>Selected ({selectedRegistrantList.length})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegistrants({})}
                      className="text-primary-text hover:underline text-2xs font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {selectedRegistrantList.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border-control text-fg shadow-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                          {getInitials(r.name)}
                        </span>
                        <span className="max-w-[130px] truncate font-medium">
                          {r.name}
                        </span>
                        <span className="text-2xs text-fg-muted font-mono">
                          ({r.registrationNumber})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRecipient(r.id)}
                          className="text-fg-subtle hover:text-danger-text transition-colors ml-0.5"
                          title="Remove recipient"
                          aria-label={`Remove ${r.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subject Field & Placeholders */}
          <div className="flex flex-col gap-1.5">
            <Controller
              name="subject"
              control={control}
              rules={{ required: "Subject is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email Subject"
                  placeholder="e.g. Updates for {{eventTitle}}, {{firstName}}!"
                  error={errors.subject?.message}
                  required
                />
              )}
            />
            {/* Placeholder Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-2xs text-fg-muted flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary-text" />
                Placeholders:
              </span>
              {[
                "{{firstName}}",
                "{{eventTitle}}",
                "{{registrationNumber}}",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertPlaceholder(tag)}
                  className="text-2xs font-mono px-2 py-0.5 rounded-md bg-muted text-primary-text hover:bg-primary-soft transition-colors cursor-pointer"
                  title={`Click to append ${tag} to subject`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <Controller
            name="heading"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Banner Heading (Optional)"
                placeholder="e.g. Event Announcement"
                error={errors.heading?.message}
              />
            )}
          />

          {/* Message Body */}
          <Controller
            name="message"
            control={control}
            rules={{ required: "Message body is required" }}
            render={({ field }) => (
              <RichTextEditor
                {...field}
                label="Message Body"
                placeholder="Write your email announcement or reminder here..."
                error={errors.message?.message}
                required
              />
            )}
          />

          {/* Announcement Flyer Image */}
          <div className="space-y-2 pt-1 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-fg block">
                Announcement Flyer Image (Optional)
              </label>
              <span className="text-2xs text-fg-muted">
                Max 3MB (JPEG, PNG, WEBP)
              </span>
            </div>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="https://... or upload flyer image"
                  error={errors.imageUrl?.message}
                />
              )}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted-strong cursor-pointer text-xs font-semibold text-fg-secondary transition-colors">
                {isUploadingFlyer ? (
                  <Spinner size="sm" />
                ) : (
                  <Upload className="w-4 h-4 text-primary-text" />
                )}
                <span>
                  {isUploadingFlyer ? "Uploading..." : "Upload Image File"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFlyerUpload}
                  disabled={isUploadingFlyer}
                  className="hidden"
                />
              </label>
            </div>
            {flyerImageUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-control bg-subtle mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flyerImageUrl}
                  alt="Flyer Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue("imageUrl", "")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Include QR Pass Switch */}
          <Controller
            name="includeQrPass"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                label="Include QR Check-In Pass"
                description="Attaches attendee's unique QR pass and event summary card in the email"
                color="indigo"
              />
            )}
          />

          {/* Optional Call to Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
            <Controller
              name="ctaLabel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="CTA Button Label (Optional)"
                  placeholder="e.g. View Venue Map"
                  error={errors.ctaLabel?.message}
                />
              )}
            />
            <Controller
              name="ctaUrl"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="CTA Button URL (Optional)"
                  placeholder="https://example.org/map"
                  error={errors.ctaUrl?.message}
                />
              )}
            />
          </div>

          {/* Form Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 pt-4 sm:flex-row-reverse sm:border-t sm:border-border-subtle">
            <Button
              className="w-full !h-11"
              type="submit"
              disabled={
                isSendingEmail ||
                (!sendToAllRegistrants && selectedRegistrantIds.length === 0)
              }
              loading={isSendingEmail}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {isSendingEmail
                ? "Sending..."
                : sendToAllRegistrants
                  ? "Send to all registrants"
                  : selectedRegistrantIds.length > 0
                    ? `Send email (${selectedRegistrantIds.length})`
                    : "Send email"}
            </Button>
            <Button
              variant="outline"
              className="w-full !h-11"
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
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
