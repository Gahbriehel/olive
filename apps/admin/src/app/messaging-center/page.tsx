"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Send, X } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { ActionsList } from "@/components/ui/ActionsList";
import { Button } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { TruncatedTextWithCopy } from "@/helpers/TruncatedTextWithCopy";
import { type ISelect } from "@/components/ui/Select";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { customToast } from "@/helpers/customToast";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { usePeopleSelectQuery } from "@/hooks/usePeopleSelect";
import { useUsers } from "@/hooks/useUsers";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { IPerson } from "@/models/person";
import { EmailLogItem } from "@/models/emailLog";
import { emailService, IBatchEmailPayload } from "@/services/email.service";
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

  // Fetch admin users to populate sender filter
  const { users } = useUsers({ limit: 100 });

  const filterFields = useMemo<FilterField[]>(
    () => [
      { type: "dateRange", label: "Sent Between" },
      {
        type: "select",
        key: "deliveryStatus",
        label: "Delivery Status",
        allLabel: "All Statuses",
        options: [
          { label: "Delivered", value: "DELIVERED" },
          { label: "Bounced", value: "BOUNCED" },
          { label: "Complained", value: "COMPLAINED" },
        ],
      },
      {
        type: "select",
        key: "emailType",
        label: "Email Type",
        allLabel: "All Email Types",
        options: [
          { label: "People Broadcast", value: "BROADCAST_PEOPLE" },
          { label: "Single Person", value: "SINGLE_PERSON" },
          { label: "Registrants Broadcast", value: "BROADCAST_REGISTRANTS" },
          { label: "Single Registrant", value: "SINGLE_REGISTRANT" },
          { label: "Birthday Greeting", value: "BIRTHDAY_GREETING" },
          { label: "Admin Welcome", value: "ADMIN_WELCOME" },
        ],
      },
      ...(users.length > 0
        ? [
            {
              type: "select",
              key: "sentByUserId",
              label: "Sender",
              allLabel: "All Senders",
              options: users.map((u) => ({
                label: u.name || u.email,
                value: u.id,
              })),
            } satisfies FilterField,
          ]
        : []),
    ],
    [users],
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
    openPanel,
    panelProps,
  } = useListFilters({ fields: filterFields });

  const {
    items: emailLogs,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
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
              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-text font-bold text-xs flex items-center justify-center shrink-0 border border-primary-border">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-fg truncate">
                  {name || "—"}
                </p>
                {email ? (
                  <div className="text-2xs font-mono text-fg-muted truncate mt-0.5">
                    <TruncatedTextWithCopy
                      text={email}
                      maxLength={22}
                      textClassName="text-2xs font-mono text-fg-muted"
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
                className="text-xs font-semibold text-fg truncate"
                title={content?.subject || ""}
              >
                {content?.subject || <NotAvailable />}
              </p>
              {content?.bodyTextSnippet && (
                <p
                  className="text-2xs text-fg-muted truncate"
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
              className="text-2xs font-medium whitespace-nowrap"
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
              <span className="text-xs text-fg-subtle italic">Automated</span>
            );
          }
          return (
            <div className="text-xs min-w-0 max-w-[140px]">
              <p className="font-semibold text-fg truncate">{sender.name}</p>
              <p className="text-2xs font-mono text-fg-muted truncate">
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
              <p className="text-xs font-medium text-fg">
                {dayjs(val).format("MMM D, YYYY")}
              </p>
              <p className="text-2xs text-fg-muted">
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
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Messaging Center"
        description="Monitor sent communications and send broadcast emails to members"
        actions={
          <>
            <RefreshButton onRefetch={() => refetch()} />
            <Button
              onClick={() => setIsBroadcastModalOpen(true)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Compose Broadcast
            </Button>
          </>
        }
      />

      {/* Email Delivery Logs Table */}
      <div className="flex flex-col gap-4">
        <Table
          data={emailLogs}
          columns={columns as Array<ColumnDef<EmailLogItem>>}
          loading={isLoading || isFetching}
          searchPlaceholder="Search logs by recipient email, name, or subject..."
          search={search}
          onSearchChange={setSearch}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={setLimit}
          meta={meta}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          resource="email logs"
          emptyMessage="No email communication logs found matching criteria"
        >
          <ListToolbar
            trailing={
              <FiltersButton onClick={openPanel} activeCount={activeCount} />
            }
          />
        </Table>
      </div>

      <FiltersModal {...panelProps} />

      {/* Compose Broadcast Modal */}
      <SidebarModal
        title="Compose Broadcast"
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
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
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-subtle border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fg-secondary">
                  Selected Recipients ({selectedCount})
                </span>
                <button
                  type="button"
                  onClick={clearAllSelected}
                  className="text-2xs font-medium text-fg-muted hover:text-danger-text transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {selectedPersonList.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border-control text-fg shadow-xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-primary text-white text-2xs flex items-center justify-center font-bold">
                      {(p.firstName?.[0] || p.name?.[0] || "?").toUpperCase()}
                    </span>
                    <span className="max-w-[130px] truncate">
                      {p.name || `${p.firstName} ${p.lastName}`.trim()}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRemovePerson(p.id)}
                      className="text-fg-subtle hover:text-danger-text transition-colors ml-0.5 cursor-pointer"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
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

          <div className="mt-8 flex flex-col gap-3 pt-6 sm:flex-row-reverse sm:border-t sm:border-border-subtle">
            <Button
              className="w-full"
              type="submit"
              disabled={isSending || selectedCount === 0}
              loading={isSending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {selectedCount > 0
                ? `Send broadcast (${selectedCount})`
                : "Send broadcast"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
            >
              Cancel
            </Button>
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
