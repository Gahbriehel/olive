"use client";

import { JSX, useMemo, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IContact } from "@/models/contact";
import { extractMeta } from "@/models/base";
import { formatDate } from "@/helpers/formatDate";
import { useContactQuery } from "@/hooks/useContactQuery";
import { type IContactSubmissionType } from "@/services/contact";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { downloadCsvExport } from "@/helpers/downloadCsvExport";
import { Table } from "@/components/ui/Table";
import { ListToolbar } from "@/components/ui/ListToolbar";
import { FiltersButton } from "@/components/ui/FiltersButton";
import { ActionsList } from "@/components/ui/ActionsList";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { FiltersModal } from "@/components/modals/FiltersModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { useAuth } from "@/hooks/useAuth";
import { useListFilters } from "@/hooks/useListFilters";
import { type FilterField } from "@/models/filters";
import { ROLES, getUserRoles, hasAuthority } from "@/utils/rbac";
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  HeartHandshake,
  Tag,
  Send,
  type LucideIcon,
} from "lucide-react";

const columnHelper = createColumnHelper<IContact>();

export type ContactType = IContactSubmissionType;

interface ContactTypeConfig {
  /** Plural noun passed to Table for empty/error copy. */
  resource: string;
  searchPlaceholder: string;
  detailTitle: string;
  messageLabel: string;
  messageIcon: LucideIcon;
}

const CONTACT_TYPE_CONFIG: Record<ContactType, ContactTypeConfig> = {
  prayer: {
    resource: "prayer requests",
    searchPlaceholder: "Search prayers...",
    detailTitle: "Prayer Request Details",
    messageLabel: "Prayer Request Message",
    messageIcon: HeartHandshake,
  },
  inquiry: {
    resource: "inquiries",
    searchPlaceholder: "Search inquiries...",
    detailTitle: "Inquiry Details",
    messageLabel: "Inquiry Message",
    messageIcon: MessageSquare,
  },
};

interface ContactTableProps {
  type: ContactType;
}

export function ContactTable({ type }: ContactTableProps): JSX.Element {
  const config = CONTACT_TYPE_CONFIG[type];
  const MessageIcon = config.messageIcon;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);

  const { user } = useAuth();
  const userRoles = getUserRoles(user);
  const canExport = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const isSuperAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "category",
        label: "Category",
        placeholder: "e.g. General, Partnership...",
      },
      ...(isSuperAdmin
        ? [
            {
              type: "boolean",
              key: "isPrivate",
              label: "Privacy",
              trueLabel: "Private only",
              falseLabel: "Public only",
            } satisfies FilterField,
          ]
        : []),
    ],
    [isSuperAdmin],
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

  const columns = [
    columnHelper.accessor(
      // Number across pages, not just within the current one.
      (_, rowIndex) => padNumberWithZeros((page - 1) * limit + rowIndex + 1),
      {
        id: "s/n",
        header: "S/N",
      },
    ),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => {
        const email = info.getValue();
        if (!email) return null;
        return (
          <a
            href={`mailto:${email}`}
            className="text-primary-text hover:underline font-medium transition-colors"
          >
            {email}
          </a>
        );
      },
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
    }),
    columnHelper.accessor("category", {
      header: "Category",
    }),
    columnHelper.accessor("message", {
      header: "Message",
      cell: (info) => {
        const val = info.getValue();
        return val ? <span className="line-clamp-2">{val}</span> : null;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Date & Time",
      cell: (info) => {
        const dateVal = info.getValue();
        if (!dateVal) return null;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-fg">
              {formatDate({ date: dateVal, showTime: false })}
            </span>
            <span className="text-xs text-fg-muted">
              {new Date(dateVal).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor((rowData) => rowData, {
      id: "actions",
      header: "Actions",
      cell: ({ getValue }) => {
        return (
          <ActionsList
            actions={[
              {
                title: "View Details",
                fn: () => {
                  setSelectedContact(getValue());
                  setIsModalOpen(true);
                },
              },
            ]}
          />
        );
      },
    }),
  ];

  const { data, isLoading, isError, error, refetch } = useContactQuery(
    queryParams,
    type,
  );

  const contacts = data?.data.items;

  return (
    <>
      <Table
        data={contacts ?? []}
        meta={data?.meta || extractMeta(data)}
        columns={columns as Array<ColumnDef<IContact>>}
        loading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        resource={config.resource}
        searchPlaceholder={config.searchPlaceholder}
        search={search}
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
      >
        <ListToolbar
          actions={[
            { title: "Refresh", fn: () => refetch() },
            ...(canExport
              ? [
                  {
                    title: "Export CSV",
                    fn: () =>
                      downloadCsvExport(
                        "/contact/submissions/export",
                        { type, ...exportParams },
                        `contact-submissions-${new Date().toISOString().slice(0, 10)}.csv`,
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

      <SidebarModal
        title={config.detailTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {selectedContact && (
          <div className="flex flex-col gap-6 pt-2">
            {/* Header Avatar & Sender Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-subtle border border-border">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-sm">
                {selectedContact.name
                  ? selectedContact.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-base font-bold text-fg truncate">
                  {selectedContact.name || <NotAvailable />}
                </h3>
                {selectedContact.category ? (
                  <Badge variant="indigo" className="mt-1 w-fit font-semibold">
                    <Tag className="w-3 h-3" />
                    {selectedContact.category}
                  </Badge>
                ) : (
                  <div className="mt-1">
                    <NotAvailable />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Meta Details Grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface">
                <div className="p-2 rounded-lg bg-primary-soft text-primary-text">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-fg-subtle font-medium">
                    Email Address
                  </span>
                  {selectedContact.email ? (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm font-medium text-fg hover:text-primary-text truncate"
                    >
                      {selectedContact.email}
                    </a>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface">
                <div className="p-2 rounded-lg bg-success-soft text-success-text">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-fg-subtle font-medium">
                    Phone Number
                  </span>
                  {selectedContact.phone ? (
                    <span className="text-sm font-medium text-fg">
                      {selectedContact.phone}
                    </span>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface">
                <div className="p-2 rounded-lg bg-warning-soft text-warning-text">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-fg-subtle font-medium">
                    Date & Time Submitted
                  </span>
                  {selectedContact.createdAt ? (
                    <span className="text-sm font-medium text-fg">
                      {formatDate({
                        date: selectedContact.createdAt,
                        showTime: true,
                      })}
                    </span>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>
            </div>

            {/* Message Card */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold text-fg-muted uppercase tracking-wider">
                <MessageIcon className="w-4 h-4 text-primary-text" />
                {config.messageLabel}
              </div>
              <div className="mt-1">
                {selectedContact.message ? (
                  <p className="text-sm leading-relaxed text-fg-secondary whitespace-pre-wrap break-words [word-break:break-word]">
                    {selectedContact.message}
                  </p>
                ) : (
                  <NotAvailable />
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-5">
              {selectedContact.email && (
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
              )}
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SidebarModal>
    </>
  );
}
