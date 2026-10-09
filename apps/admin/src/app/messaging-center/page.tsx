"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Send, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { Select } from "@/components/FormElements/Select";
import { ActionsList } from "@/components/ui/ActionsList";
import { BaseButton } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { type ISelect } from "@/components/ui/Select";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { customToast } from "@/helpers/customToast";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { useUsers } from "@/hooks/useUsers";
import { IQueryParams } from "@/models/base";
import { adaptApiPersonToPerson, IPerson } from "@/models/person";
import { EmailLogItem, EmailLogQueryParams } from "@/models/emailLog";
import { emailService, IBatchEmailPayload } from "@/services/email.service";
import { peopleService } from "@/services/people.service";
import { ViewEmailLogModal } from "@/components/modals/ViewEmailLogModal";
import dayjs from "dayjs";

interface BroadcastFormValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const columnHelper = createColumnHelper<EmailLogItem>();

// Query hook for MultiSelect component to dynamically search and paginate people inside Compose Modal
function usePeopleSelectQuery(params: IQueryParams & { name?: string }) {
  const query = useQuery({
    queryKey: ["people-select", params],
    queryFn: async () => {
      const searchTerm = params.name || params.search || undefined;
      const res = await peopleService.getPeople({
        page: params.page,
        limit: params.limit || 20,
        search: searchTerm,
      });
      return {
        items: res.people.map(adaptApiPersonToPerson),
        totalCount: res.meta?.total ?? res.people.length,
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

const transformPersonToSelect = (person: IPerson): ISelect => ({
  value: {
    _id: person.id,
    person,
    email: person.email,
    phone: person.phone,
  },
  label:
    `${person.firstName} ${person.lastName}`.trim() ||
    person.name ||
    person.email ||
    "Unknown",
});

const EMAIL_TYPE_FORMATS: Record<
  string,
  {
    label: string;
    variant: "indigo" | "cyan" | "purple" | "slate" | "emerald" | "amber";
  }
> = {
  BROADCAST_PEOPLE: { label: "People Broadcast", variant: "indigo" },
  SINGLE_PERSON: { label: "Single Person", variant: "cyan" },
  BROADCAST_REGISTRANTS: { label: "Registrants Broadcast", variant: "purple" },
  SINGLE_REGISTRANT: { label: "Single Registrant", variant: "slate" },
  BIRTHDAY_GREETING: { label: "Birthday Greeting", variant: "emerald" },
  ADMIN_WELCOME: { label: "Admin Welcome", variant: "amber" },
};

export default function MessagingCenterPage() {
  const queryClient = useQueryClient();

  // Modals state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Recipient selection state for the Compose Broadcast modal
  const [selectedPersons, setSelectedPersons] = useState<
    Record<string, IPerson>
  >({});
  const [isSending, setIsSending] = useState(false);

  // Server-side query params & filters for Email Logs
  const [search, setSearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<string>("ALL");
  const [emailType, setEmailType] = useState<string>("ALL");
  const [sentByUserId, setSentByUserId] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch admin users to populate sender filter
  const { users } = useUsers({ limit: 100 });

  const queryParams: EmailLogQueryParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      deliveryStatus: deliveryStatus !== "ALL" ? deliveryStatus : undefined,
      emailType: emailType !== "ALL" ? emailType : undefined,
      sentByUserId: sentByUserId !== "ALL" ? sentByUserId : undefined,
    }),
    [page, limit, search, deliveryStatus, emailType, sentByUserId],
  );

  const {
    items: emailLogs,
    meta,
    isLoading,
    isFetching,
    refetch,
  } = useEmailLogs(queryParams);

  const selectedPersonList = useMemo(
    () => Object.values(selectedPersons),
    [selectedPersons],
  );
  const selectedPersonIds = useMemo(
    () => Object.keys(selectedPersons),
    [selectedPersons],
  );
  const selectedCount = selectedPersonList.length;

  // Convert selected persons to ISelect[] for the MultiSelect component in modal
  const multiSelectValue: ISelect[] = useMemo(() => {
    return Object.values(selectedPersons).map(transformPersonToSelect);
  }, [selectedPersons]);

  const handleMultiSelectChange = useCallback(
    (newValues: ISelect[]) => {
      const next: Record<string, IPerson> = {};
      newValues.forEach((item) => {
        const personId = item.value._id;
        if (!personId) return;

        const person =
          item.value.person ||
          selectedPersons[personId] ||
          ({
            id: personId,
            name: item.label,
            firstName: item.label.split(" ")[0] || item.label,
            lastName: item.label.split(" ").slice(1).join(" ") || "",
            email: item.value.email || "",
            phone: item.value.phone || "",
            gender: "Male",
            dob: "",
            membershipStatus: "Member",
            registrationHistoryCount: 0,
            eventsAttendedCount: 0,
            registrations: [],
            attendanceHistory: [],
          } as IPerson);

        next[personId] = person;
      });
      setSelectedPersons(next);
    },
    [selectedPersons],
  );

  const toggleRemovePerson = useCallback((personId: string) => {
    setSelectedPersons((prev) => {
      const next = { ...prev };
      delete next[personId];
      return next;
    });
  }, []);

  const clearAllSelected = useCallback(() => {
    setSelectedPersons({});
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setDeliveryStatus(value);
    setPage(1);
  }, []);

  const handleEmailTypeChange = useCallback((value: string) => {
    setEmailType(value);
    setPage(1);
  }, []);

  const handleSenderChange = useCallback((value: string) => {
    setSentByUserId(value);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setDeliveryStatus("ALL");
    setEmailType("ALL");
    setSentByUserId("ALL");
    setPage(1);
  }, []);

  const isFiltered =
    Boolean(search) ||
    deliveryStatus !== "ALL" ||
    emailType !== "ALL" ||
    sentByUserId !== "ALL";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    defaultValues: {
      subject: "",
      heading: "",
      message: "",
      ctaLabel: "",
      ctaUrl: "",
    },
  });

  const onSubmit = async (formData: BroadcastFormValues) => {
    if (selectedPersonIds.length === 0) {
      customToast.error(
        "Please select at least one recipient to send the broadcast.",
      );
      return;
    }

    try {
      setIsSending(true);
      const payload: IBatchEmailPayload = {
        personIds: selectedPersonIds,
        subject: formData.subject.trim(),
        heading: formData.heading.trim(),
        message: formData.message.trim(),
        ctaLabel: formData.ctaLabel?.trim()
          ? formData.ctaLabel.trim()
          : undefined,
        ctaUrl: formData.ctaUrl?.trim() ? formData.ctaUrl.trim() : undefined,
      };

      await emailService.sendBatchEmail(payload);
      reset();
      clearAllSelected();
      setIsBroadcastModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    } catch {
      // apiClient response interceptor already surfaces error toasts
    } finally {
      setIsSending(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (_, rowIndex) => padNumberWithZeros((page - 1) * limit + rowIndex + 1),
        {
          id: "s/n",
          header: "S/N",
        },
      ),
      columnHelper.accessor("recipient", {
        header: "Recipient",
        cell: ({ row }) => {
          const recipient = row.original.recipient;
          const email = recipient?.email;
          const name = recipient?.name;
          const initial = (name?.[0] || email?.[0] || "?").toUpperCase();

          return (
            <div className="flex items-center gap-2.5 min-w-0 max-w-[220px]">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {name || "—"}
                </p>
                {email ? (
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    <TruncatedTextWithCopy
                      text={email}
                      maxLength={22}
                      textClassName="text-[11px] font-mono text-slate-500 dark:text-slate-400"
                    />
                  </div>
                ) : (
                  <NotAvailable />
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("content", {
        header: "Subject & Message",
        cell: ({ row }) => {
          const content = row.original.content;
          return (
            <div className="min-w-0 max-w-[260px] space-y-0.5">
              <p
                className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate"
                title={content?.subject || ""}
              >
                {content?.subject || <NotAvailable />}
              </p>
              {content?.bodyTextSnippet && (
                <p
                  className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                  title={content.bodyTextSnippet}
                >
                  {content.bodyTextSnippet}
                </p>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("emailType", {
        header: "Email Type",
        cell: ({ getValue }) => {
          const type = getValue();
          const config = EMAIL_TYPE_FORMATS[type];
          return (
            <Badge
              variant={config?.variant || "indigo"}
              size="sm"
              className="text-[10px] font-medium whitespace-nowrap"
            >
              {config?.label || type || "—"}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("deliveryStatus", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} size="sm" />,
      }),
      columnHelper.accessor("sentBy", {
        header: "Sent By",
        cell: ({ getValue }) => {
          const sender = getValue();
          if (!sender) {
            return (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Automated
              </span>
            );
          }
          return (
            <div className="text-xs min-w-0 max-w-[140px]">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {sender.name}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {sender.email}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Sent",
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return <NotAvailable />;
          return (
            <div className="space-y-0.5 whitespace-nowrap">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {dayjs(val).format("MMM D, YYYY")}
              </p>
              <p className="text-[10px] text-slate-400">
                {dayjs(val).format("h:mm A")}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor((rowData) => rowData, {
        id: "actions",
        header: "Actions",
        cell: ({ getValue }) => {
          const item = getValue();
          return (
            <ActionsList
              actions={[
                {
                  title: "View Details",
                  fn: () => {
                    setSelectedLog(item);
                    setIsLogModalOpen(true);
                  },
                },
              ]}
            />
          );
        },
      }),
    ],
    [page, limit],
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Messaging Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor sent communications and send broadcast emails to members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefetch={() => refetch()} />
          <BaseButton
            className="!h-10"
            text="Compose Broadcast"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setIsBroadcastModalOpen(true)}
          />
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Select
              value={deliveryStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filter by delivery status"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="BOUNCED">Bounced</option>
              <option value="COMPLAINED">Complained</option>
            </Select>
          </div>

          {/* Email Type Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={emailType}
              onChange={(e) => handleEmailTypeChange(e.target.value)}
              aria-label="Filter by email type"
            >
              <option value="ALL">All Email Types</option>
              <option value="BROADCAST_PEOPLE">People Broadcast</option>
              <option value="SINGLE_PERSON">Single Person</option>
              <option value="BROADCAST_REGISTRANTS">
                Registrants Broadcast
              </option>
              <option value="SINGLE_REGISTRANT">Single Registrant</option>
              <option value="BIRTHDAY_GREETING">Birthday Greeting</option>
              <option value="ADMIN_WELCOME">Admin Welcome</option>
            </Select>
          </div>

          {/* Sender Filter */}
          {users.length > 0 && (
            <div className="w-full sm:w-48">
              <Select
                value={sentByUserId}
                onChange={(e) => handleSenderChange(e.target.value)}
                aria-label="Filter by sender"
              >
                <option value="ALL">All Senders</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Email Delivery Logs Table */}
      <div className="flex flex-col gap-4">
        <Table
          data={emailLogs}
          columns={columns as Array<ColumnDef<EmailLogItem>>}
          loading={isLoading || isFetching}
          searchPlaceholder="Search logs by recipient email, name, or subject..."
          search={search}
          onSearchChange={handleSearchChange}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          meta={meta}
          emptyMessage="No email communication logs found matching criteria"
        />
      </div>

      {/* Compose Broadcast Modal */}
      <SidebarModal
        title="Compose Broadcast"
        display={isBroadcastModalOpen}
        close={() => setIsBroadcastModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* MultiSelect Element for Recipients */}
          <div className="flex flex-col gap-1.5">
            <MultiSelect
              label="Recipients"
              placeholder="Search & select recipients..."
              value={multiSelectValue}
              onChange={handleMultiSelectChange}
              queryHook={usePeopleSelectQuery}
              dataKey="items"
              transformData={transformPersonToSelect}
              closeIconFn={clearAllSelected}
              required
            />
          </div>

          {selectedCount > 0 && (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selected Recipients ({selectedCount})
                </span>
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {selectedPersonList.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 shadow-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {(p.firstName?.[0] || p.name?.[0] || "?").toUpperCase()}
                    </span>
                    <span className="max-w-[130px] truncate">
                      {p.name || `${p.firstName} ${p.lastName}`.trim()}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRemovePerson(p.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                      title="Remove recipient"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <Controller
            name="subject"
            control={control}
            rules={{ required: "Message subject is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Message Subject"
                placeholder="e.g. Weekly Fellowship & Community Announcement"
                error={errors.subject?.message}
                required
              />
            )}
          />

          <Controller
            name="heading"
            control={control}
            rules={{ required: "Heading is required" }}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Heading"
                placeholder="e.g. Welcome to Sunday Service"
                error={errors.heading?.message}
                required
              />
            )}
          />

          <Controller
            name="message"
            control={control}
            rules={{ required: "Message body is required" }}
            render={({ field }) => (
              <RichTextEditor
                {...field}
                label="Message Body"
                placeholder="Write your broadcast message here..."
                error={errors.message?.message}
                required
              />
            )}
          />

          {/* Call to Action Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <Controller
              name="ctaLabel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="CTA Button Label (Optional)"
                  placeholder="e.g. Read More"
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
                  placeholder="https://example.org/news"
                  error={errors.ctaUrl?.message}
                />
              )}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 pt-6 sm:flex-row-reverse sm:border-t sm:border-gray-50 dark:sm:border-slate-900">
            <BaseButton
              text={
                selectedCount > 0
                  ? `Send broadcast (${selectedCount})`
                  : "Send broadcast"
              }
              className="w-full !h-11"
              type="submit"
              disabled={isSending || selectedCount === 0}
              loading={isSending}
              icon={<Send className="w-4 h-4" />}
              position="icon-last"
            />
            <BaseButton
              text="Cancel"
              color="outline"
              className="w-full !h-11"
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
            />
          </div>
        </form>
      </SidebarModal>

      {/* View Email Log Details Modal */}
      <ViewEmailLogModal
        log={selectedLog}
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
