"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Users,
  Calendar,
  Mail,
  Send,
  X,
  Sparkles,
  Upload,
  Loader2,
  Trash2,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, BaseButton } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Select } from "@/components/FormElements/Select";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Switch } from "@/components/FormElements/Switch";
import { StatsCard } from "@/components/ui/StatsCard";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { getInitials } from "@/utils/formatters";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { exportToCsv } from "@/helpers/exportCsv";
import { customToast } from "@/helpers/customToast";
import { useDashboard } from "@/context/DashboardContext";
import { useRegistrations } from "@/hooks/useRegistrations";
import { useTeams } from "@/hooks/useTeams";
import { adaptApiRegistrationToRegistration } from "@/models/registration";
import { adaptApiTeamToTeam } from "@/models/team";
import { IRegistration } from "@/types/dashboard";
import { type ISelect } from "@/components/ui/Select";
import { type IQueryParams } from "@/models/base";
import {
  emailService,
  ISendBatchRegistrantsEmailPayload,
} from "@/services/email.service";
import { registrationsService } from "@/services/registrations.service";
import { uploadsService } from "@/services/uploads.service";

interface EmailFormValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass: boolean;
  imageUrl?: string;
}

// Query hook for MultiSelect component to search and paginate registrants
function useRegistrationsSelectQuery(params: IQueryParams & { name?: string }) {
  const { selectedEventId } = useDashboard();
  const query = useQuery({
    queryKey: ["registrations-select", selectedEventId, params],
    queryFn: async () => {
      const searchTerm = params.name || params.search || undefined;
      const res = await registrationsService.getRegistrations({
        eventId: selectedEventId || undefined,
        page: params.page,
        limit: params.limit || 20,
        search: searchTerm,
      });
      return {
        items: res.registrations.map(adaptApiRegistrationToRegistration),
        totalCount: res.meta?.total ?? res.registrations.length,
      };
    },
    staleTime: 1000 * 60,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [teamId, setTeamId] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRegistration, setSelectedRegistration] =
    useState<IRegistration | null>(null);

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendToAllRegistrants, setSendToAllRegistrants] = useState(true);
  const [selectedRegistrants, setSelectedRegistrants] = useState<
    Record<string, IRegistration>
  >({});

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

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      const pageSize = 200;
      let allRegistrations: IRegistration[] = [];
      let currentPage = 1;
      let total = Infinity;

      while (allRegistrations.length < total) {
        const res = await registrationsService.getRegistrations({
          eventId: selectedEventId || undefined,
          search: search || undefined,
          status: status !== "All" ? status : undefined,
          teamId: teamId !== "All" ? teamId : undefined,
          page: currentPage,
          limit: pageSize,
        });

        if (res.registrations.length === 0) break;

        allRegistrations = allRegistrations.concat(
          res.registrations.map(adaptApiRegistrationToRegistration),
        );
        total = res.meta?.total ?? allRegistrations.length;
        currentPage += 1;
      }

      exportToCsv(allRegistrations);
    } catch {
      customToast.error("Failed to export registrations");
    } finally {
      setIsExporting(false);
    }
  }, [selectedEventId, search, status, teamId]);

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
        if (status !== "All") {
          const statusMap: Record<
            string,
            "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"
          > = {
            "Checked-In": "CHECKED_IN",
            Confirmed: "CONFIRMED",
            Cancelled: "CANCELLED",
          };
          if (statusMap[status]) {
            payload.status = statusMap[status];
          }
        }
        if (teamId !== "All") {
          payload.teamId = teamId;
        }
        if (search.trim()) {
          payload.search = search.trim();
        }
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
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <RefreshButton onRefetch={refetch} />
          <Button
            variant="outline"
            onClick={handleExportCsv}
            loading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV Roster
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenEmailModal}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            Send Email
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

      {/* Compose Batch Email Sidebar Modal */}
      <SidebarModal
        display={isEmailModalOpen}
        close={() => setIsEmailModalOpen(false)}
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
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Target: All Event Registrants</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Email will be sent to all matching registrants (
                {totalReg.toLocaleString()} attendees)
                {status !== "All" && ` with status: ${status}`}
                {teamId !== "All" && " for selected team"}.
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
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Selected ({selectedRegistrantList.length})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegistrants({})}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-[11px] font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {selectedRegistrantList.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                          {getInitials(r.name)}
                        </span>
                        <span className="max-w-[130px] truncate font-medium">
                          {r.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({r.registrationNumber})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRecipient(r.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                          title="Remove recipient"
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
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
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
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
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
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Announcement Flyer Image (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
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
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                {isUploadingFlyer ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-500" />
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
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 mt-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
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
          <div className="mt-6 flex flex-col gap-3 pt-4 sm:flex-row-reverse sm:border-t sm:border-gray-100 dark:sm:border-zinc-800">
            <BaseButton
              text={
                isSendingEmail
                  ? "Sending..."
                  : sendToAllRegistrants
                    ? "Send to all registrants"
                    : selectedRegistrantIds.length > 0
                      ? `Send email (${selectedRegistrantIds.length})`
                      : "Send email"
              }
              className="w-full !h-11"
              type="submit"
              disabled={
                isSendingEmail ||
                (!sendToAllRegistrants && selectedRegistrantIds.length === 0)
              }
              loading={isSendingEmail}
              icon={<Send className="w-4 h-4" />}
              position="icon-last"
            />
            <BaseButton
              text="Cancel"
              color="outline"
              className="w-full !h-11"
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
            />
          </div>
        </form>
      </SidebarModal>

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
