"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Check, X, Clock } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { ActionsList } from "@/components/ui/ActionsList";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { useConfirmOutreach, useOutreachList } from "@/hooks/useOutreach";
import { useUsers } from "@/hooks/useUsers";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import {
  OutreachMessage,
  OutreachPurpose,
  OutreachStatus,
} from "@/models/outreach";
import dayjs from "dayjs";

const columnHelper = createColumnHelper<OutreachMessage>();

const PURPOSE_FORMATS: Record<
  OutreachPurpose,
  { label: string; variant: "indigo" | "emerald" | "amber" | "purple" }
> = {
  BIRTHDAY: { label: "Birthday", variant: "indigo" },
  VISITOR_FOLLOW_UP: { label: "Visitor Follow-up", variant: "purple" },
  PASTORAL_CHECK_IN: { label: "Pastoral Check-in", variant: "amber" },
};

export function WhatsAppLogTable() {
  const [selectedMessage, setSelectedMessage] =
    useState<OutreachMessage | null>(null);
  const confirmMutation = useConfirmOutreach();

  const { users } = useUsers({ limit: 100 });

  const filterFields = useMemo<FilterField[]>(
    () => [
      { type: "dateRange", label: "Date Range" },
      {
        type: "select",
        key: "purpose",
        label: "Purpose",
        allLabel: "All Purposes",
        options: [
          { label: "Birthday", value: "BIRTHDAY" },
          { label: "Visitor Follow-up", value: "VISITOR_FOLLOW_UP" },
          { label: "Pastoral Check-in", value: "PASTORAL_CHECK_IN" },
        ],
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        allLabel: "All Statuses",
        options: [
          { label: "Confirmed Sent", value: "CONFIRMED_SENT" },
          { label: "Opened", value: "OPENED" },
          { label: "Not Sent", value: "NOT_SENT" },
        ],
      },
      ...(users.length > 0
        ? [
            {
              type: "select",
              key: "sentByUserId",
              label: "Sent By",
              allLabel: "All Staff",
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
    filters,
    openPanel,
    panelProps,
    activeCount,
  } = useListFilters({ fields: filterFields });

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      purpose: filters.purpose as OutreachPurpose | undefined,
      status: filters.status as OutreachStatus | undefined,
      sentByUserId: filters.sentByUserId,
      from: filters.startDate,
      to: filters.endDate,
    };
  }, [page, limit, filters]);

  const { data, isLoading, isError, error, refetch } =
    useOutreachList(queryParams);

  const items = data?.items || [];
  const meta = data?.meta;

  const handleConfirm = useCallback(
    (id: string, sent: boolean, personId: string) => {
      confirmMutation.mutate(
        { id, sent, personId },
        {
          onSuccess: () => {
            if (selectedMessage?.id === id) {
              setSelectedMessage(null);
            }
          },
        },
      );
    },
    [confirmMutation, selectedMessage?.id],
  );

  const columns = useMemo<ColumnDef<OutreachMessage>[]>(
    () =>
      [
        columnHelper.accessor(
          (_, rowIndex) => (page - 1) * limit + rowIndex + 1,
          {
            id: "sn",
            header: "S/N",
            cell: (info) => (
              <span className="font-mono text-2xs text-muted-foreground">
                {padNumberWithZeros(info.getValue())}
              </span>
            ),
          },
        ),
        columnHelper.accessor(
          (row) =>
            row.person
              ? `${row.person.firstName} ${row.person.lastName}`
              : row.personId,
          {
            id: "recipient",
            header: "Recipient",
            cell: ({ row }) => {
              const item = row.original;
              const name = item.person
                ? `${item.person.firstName} ${item.person.lastName}`.trim()
                : "Recipient";
              return (
                <div>
                  <p className="font-semibold text-foreground text-xs">
                    {name}
                  </p>
                  <p className="text-2xs text-muted-foreground font-mono">
                    {item.toPhone || "No phone"}
                  </p>
                </div>
              );
            },
          },
        ),
        columnHelper.accessor("purpose", {
          header: "Purpose",
          cell: ({ getValue }) => {
            const val = getValue() as OutreachPurpose;
            const config = (val && PURPOSE_FORMATS[val]) || {
              label: String(val || "Unknown"),
              variant: "emerald" as const,
            };
            return (
              <Badge
                variant={config.variant}
                size="sm"
                className="text-2xs font-medium whitespace-nowrap"
              >
                {config.label}
              </Badge>
            );
          },
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: ({ row }) => {
            const item = row.original;
            if (item.status === "CONFIRMED_SENT") {
              return (
                <Badge
                  variant="emerald"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Check className="w-3 h-3 mr-1" /> Confirmed Sent
                </Badge>
              );
            }
            if (item.status === "OPENED") {
              return (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Badge variant="amber" size="sm">
                    <Clock className="w-3 h-3 mr-1" /> Opened
                  </Badge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(item.id, true, item.personId);
                    }}
                    className="p-1 rounded-md text-2xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors"
                    title="Confirm as sent"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(item.id, false, item.personId);
                    }}
                    className="p-1 rounded-md text-2xs border border-border-control bg-surface hover:bg-muted text-fg-muted transition-colors"
                    title="Mark as not sent"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }
            return (
              <Badge variant="slate" size="sm" className="whitespace-nowrap">
                Not Sent
              </Badge>
            );
          },
        }),
        columnHelper.accessor((row) => row.sentBy?.name || "Staff", {
          id: "sentBy",
          header: "Staff",
          cell: (info) => (
            <span className="text-xs text-muted-foreground">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("openedAt", {
          header: "Date Opened",
          cell: ({ getValue }) => {
            const val = getValue();
            return (
              <div className="space-y-0.5 whitespace-nowrap">
                <p className="text-xs font-medium text-foreground">
                  {dayjs(val).format("MMM D, YYYY")}
                </p>
                <p className="text-2xs text-muted-foreground">
                  {dayjs(val).format("h:mm A")}
                </p>
              </div>
            );
          },
        }),
        columnHelper.accessor("body", {
          header: "Message Preview",
          cell: ({ getValue }) => {
            const text = getValue() || "";
            return (
              <p className="text-xs text-muted-foreground max-w-xs truncate">
                {text}
              </p>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const item = row.original;
            return (
              <ActionsList
                actions={[
                  {
                    title: "View Details",
                    fn: () => setSelectedMessage(item),
                  },
                  ...(item.status === "OPENED"
                    ? [
                        {
                          title: "Confirm as Sent",
                          fn: () => handleConfirm(item.id, true, item.personId),
                        },
                        {
                          title: "Mark as Not Sent",
                          fn: () =>
                            handleConfirm(item.id, false, item.personId),
                        },
                      ]
                    : []),
                ]}
              />
            );
          },
        }),
      ] as ColumnDef<OutreachMessage>[],
    [page, limit, handleConfirm],
  );

  return (
    <div className="space-y-4">
      <Table
        data={items}
        columns={columns}
        loading={isLoading}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        meta={meta}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        resource="WhatsApp logs"
        emptyMessage="No WhatsApp outreach logs found matching criteria"
        onRowClick={(item) => setSelectedMessage(item)}
      >
        <ListToolbar
          trailing={
            <FiltersButton onClick={openPanel} activeCount={activeCount} />
          }
        />
      </Table>

      <FiltersModal {...panelProps} />

      {/* Message details modal */}
      {selectedMessage && (
        <Modal
          isOpen={Boolean(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          title="WhatsApp Message Record"
          maxWidth="md"
          footerStart={
            <Button
              variant="outline"
              type="button"
              onClick={() => setSelectedMessage(null)}
            >
              Close
            </Button>
          }
          footer={
            selectedMessage.status === "OPENED" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  disabled={confirmMutation.isPending}
                  onClick={() =>
                    handleConfirm(
                      selectedMessage.id,
                      false,
                      selectedMessage.personId,
                    )
                  }
                >
                  Mark as Not Sent
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={confirmMutation.isPending}
                  loading={confirmMutation.isPending}
                  onClick={() =>
                    handleConfirm(
                      selectedMessage.id,
                      true,
                      selectedMessage.personId,
                    )
                  }
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Confirm Sent
                </Button>
              </div>
            ) : undefined
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-subtle border border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xs uppercase text-muted-foreground font-semibold">
                  Recipient
                </p>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedMessage.person
                    ? `${selectedMessage.person.firstName} ${selectedMessage.person.lastName}`
                    : "Recipient"}
                </p>
                <p className="text-2xs text-muted-foreground font-mono">
                  {selectedMessage.toPhone}
                </p>
              </div>
              <div>
                <p className="text-2xs uppercase text-muted-foreground font-semibold">
                  Purpose & Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="indigo" size="sm">
                    {selectedMessage.purpose}
                  </Badge>
                  <Badge
                    variant={
                      selectedMessage.status === "CONFIRMED_SENT"
                        ? "emerald"
                        : selectedMessage.status === "OPENED"
                          ? "amber"
                          : "slate"
                    }
                    size="sm"
                  >
                    {selectedMessage.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-2xs uppercase text-muted-foreground font-semibold">
                  Opened At
                </p>
                <p className="text-foreground mt-0.5">
                  {dayjs(selectedMessage.openedAt).format(
                    "MMMM D, YYYY [at] h:mm A",
                  )}
                </p>
              </div>
              <div>
                <p className="text-2xs uppercase text-muted-foreground font-semibold">
                  Staff Member
                </p>
                <p className="text-foreground mt-0.5">
                  {selectedMessage.sentBy?.name || "Staff"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-2xs uppercase text-muted-foreground font-bold tracking-wider mb-1.5">
                Message Body
              </p>
              <div className="p-3.5 rounded-xl border border-border bg-card text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedMessage.body}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default WhatsAppLogTable;
