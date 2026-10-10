"use client";

import { useState, useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Send } from "lucide-react";
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
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { useUsers } from "@/hooks/useUsers";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { EmailLogItem } from "@/models/emailLog";
import { ViewEmailLogModal } from "@/components/modals/ViewEmailLogModal";
import { BroadcastComposer } from "./_components/BroadcastComposer";
import dayjs from "dayjs";

const columnHelper = createColumnHelper<EmailLogItem>();

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
  // Modals state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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
        <BroadcastComposer
          onCancel={() => setIsBroadcastModalOpen(false)}
          onSent={() => setIsBroadcastModalOpen(false)}
        />
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
