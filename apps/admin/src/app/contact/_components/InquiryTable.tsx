"use client";

import { JSX, useState } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { IContact } from "@/models/contact";
import { formatDate } from "@/helpers/formatDate";
import { useContactQuery } from "@/hooks/useContactQuery";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { Table } from "@/components/ui/Table";
import { ActionsList } from "@/components/ui/ActionsList";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { BaseButton } from "@/components/ui/Button";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { Mail, Phone, Calendar, MessageSquare, Tag, Send } from "lucide-react";

const columnHelper = createColumnHelper<IContact>();

export function InquiryTable(): JSX.Element {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);

  const columns = [
    columnHelper.accessor((_, rowIndex) => padNumberWithZeros(rowIndex + 1), {
      id: "s/n",
      header: "S/N",
    }),
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
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors"
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
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {formatDate({ date: dateVal, showTime: false })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
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

  const { data, isLoading } = useContactQuery(
    {
      page: page,
      limit: limit,
      search: search,
    },
    "inquiry",
  );

  const inquiries = data?.data.items;

  return (
    <>
      <Table
        data={inquiries ?? []}
        columns={columns as Array<ColumnDef<IContact>>}
        loading={isLoading}
        searchPlaceholder="Search inquiries..."
        search={search}
        onSearchChange={(query) => {
          setSearch(query);
          setPage(1);
        }}
        page={page}
        onPageChange={(page) => setPage(page)}
        limit={limit}
        onLimitChange={(limit) => setLimit(limit)}
      />

      <SidebarModal
        title="Inquiry Details"
        display={isModalOpen}
        close={() => setIsModalOpen(false)}
      >
        {selectedContact && (
          <div className="flex flex-col gap-6 pt-2">
            {/* Header Avatar & Sender Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
                {selectedContact.name
                  ? selectedContact.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selectedContact.name || <NotAvailable />}
                </h3>
                {selectedContact.category ? (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 w-fit">
                    <Tag className="w-3 h-3" />
                    {selectedContact.category}
                  </span>
                ) : (
                  <div className="mt-1">
                    <NotAvailable />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Meta Details Grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Email Address
                  </span>
                  {selectedContact.email ? (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                    >
                      {selectedContact.email}
                    </a>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Phone Number
                  </span>
                  {selectedContact.phone ? (
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedContact.phone}
                    </span>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Date & Time Submitted
                  </span>
                  {selectedContact.createdAt ? (
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
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

            {/* Inquiry Message Card */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Inquiry Message
              </div>
              <div className="mt-1">
                {selectedContact.message ? (
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                ) : (
                  <NotAvailable />
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-zinc-800 pt-5">
              {selectedContact.email && (
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs shadow-indigo-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply via Email
                </a>
              )}
              <BaseButton
                text="Close"
                color="outline"
                className="!h-10 !text-xs font-semibold"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </SidebarModal>
    </>
  );
}
