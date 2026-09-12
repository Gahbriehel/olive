"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Send, Mail, Phone, User, X } from "lucide-react";
import { Input } from "@/components/FormElements/Input";
import { MultiSelect } from "@/components/FormElements/MultiSelect";
import { RichTextEditor } from "@/components/FormElements/RichTextEditor";
import { ActionsList } from "@/components/ui/ActionsList";
import { BaseButton } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table } from "@/components/ui/Table";
import { NotAvailable } from "@/components/ui/NotAvailable";
import { type ISelect } from "@/components/ui/Select";
import { padNumberWithZeros } from "@/helpers/padNumberWithZeros";
import { customToast } from "@/helpers/customToast";
import { usePeople } from "@/hooks/usePeople";
import { IQueryParams } from "@/models/base";
import { adaptApiPersonToPerson, IPerson } from "@/models/person";
import { emailService, IBatchEmailPayload } from "@/services/email.service";
import { peopleService } from "@/services/people.service";

interface BroadcastFormValues {
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const columnHelper = createColumnHelper<IPerson>();

// Query hook for MultiSelect component to dynamically search and paginate people
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

export default function MessagingCenterPage() {
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [selectedPersons, setSelectedPersons] = useState<
    Record<string, IPerson>
  >({});
  const [isSending, setIsSending] = useState(false);

  // Server-side query params
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
    }),
    [page, limit, search],
  );

  const { people: apiPeople, meta, isLoading } = usePeople(queryParams);

  const people = useMemo(
    () =>
      Array.isArray(apiPeople) ? apiPeople.map(adaptApiPersonToPerson) : [],
    [apiPeople],
  );

  const selectedPersonList = useMemo(
    () => Object.values(selectedPersons),
    [selectedPersons],
  );
  const selectedPersonIds = useMemo(
    () => Object.keys(selectedPersons),
    [selectedPersons],
  );
  const selectedCount = selectedPersonList.length;

  // Convert selected persons to ISelect[] for the MultiSelect component
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
          people.find((p) => p.id === personId) ||
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
    [people, selectedPersons],
  );

  const isAllOnPageSelected = useMemo(() => {
    return (
      people.length > 0 && people.every((p) => Boolean(selectedPersons[p.id]))
    );
  }, [people, selectedPersons]);

  const isSomeOnPageSelected = useMemo(() => {
    return (
      !isAllOnPageSelected && people.some((p) => Boolean(selectedPersons[p.id]))
    );
  }, [people, selectedPersons, isAllOnPageSelected]);

  const toggleSelectPerson = useCallback((person: IPerson) => {
    setSelectedPersons((prev) => {
      const next = { ...prev };
      if (next[person.id]) {
        delete next[person.id];
      } else {
        next[person.id] = person;
      }
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedPersons((prev) => {
      const next = { ...prev };
      if (isAllOnPageSelected) {
        people.forEach((p) => {
          delete next[p.id];
        });
      } else {
        people.forEach((p) => {
          next[p.id] = p;
        });
      }
      return next;
    });
  }, [isAllOnPageSelected, people]);

  const clearAllSelected = useCallback(() => {
    setSelectedPersons({});
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch((prevSearch) => {
      if (prevSearch !== newSearch) {
        setPage(1);
      }
      return newSearch;
    });
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
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
    } catch {
      // apiClient response interceptor already surfaces error toasts
    } finally {
      setIsSending(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllOnPageSelected}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeOnPageSelected;
                }
              }}
              onChange={toggleSelectAllOnPage}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 dark:accent-indigo-500"
              aria-label="Select all on this page"
            />
          </div>
        ),
        cell: ({ row }) => {
          const person = row.original;
          const isSelected = Boolean(selectedPersons[person.id]);
          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectPerson(person)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                aria-label={`Select ${person.name || person.firstName}`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor(
        (_, rowIndex) => padNumberWithZeros((page - 1) * limit + rowIndex + 1),
        {
          id: "s/n",
          header: "S/N",
        },
      ),
      columnHelper.accessor("firstName", {
        header: "First Name",
        cell: (info) => <span>{info.getValue() as string}</span>,
      }),
      columnHelper.accessor("lastName", {
        header: "Last Name",
        cell: (info) => <span>{info.getValue() as string}</span>,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("phone", {
        header: "Phone Number",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("membershipStatus", {
        header: "Membership",
        cell: (info) => <StatusBadge status={info.getValue()} size="sm" />,
      }),
      columnHelper.accessor((rowData) => rowData, {
        id: "actions",
        header: "Actions",
        cell: ({ getValue }) => {
          return (
            <ActionsList
              actions={[
                {
                  title: "View",
                  fn: () => {
                    setSelectedPerson(getValue());
                    setIsModalOpen(true);
                  },
                },
              ]}
            />
          );
        },
      }),
    ],
    [
      page,
      limit,
      isAllOnPageSelected,
      isSomeOnPageSelected,
      selectedPersons,
      toggleSelectAllOnPage,
      toggleSelectPerson,
    ],
  );

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Messaging Center
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Manage communications and send broadcast messages to members
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <BaseButton
              className="!h-10"
              color="outline"
              text="Clear selected"
              icon={<X className="w-4 h-4" />}
              onClick={clearAllSelected}
            />
          )}
          <BaseButton
            className="!h-10"
            text={
              selectedCount > 0
                ? `Send broadcast (${selectedCount})`
                : "Send broadcast"
            }
            icon={<Send className="w-4 h-4" />}
            onClick={() => setIsBroadcastModalOpen(true)}
          />
        </div>
      </div>

      {/* Server-side Paginated & Filtered Table */}
      <div className="flex flex-col gap-4">
        <Table
          data={people}
          columns={columns as Array<ColumnDef<IPerson>>}
          loading={isLoading}
          searchPlaceholder="Search recipients by name, email, or phone..."
          search={search}
          onSearchChange={handleSearchChange}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          meta={meta}
        />
      </div>

      {/* Compose Broadcast Modal */}
      <SidebarModal
        title="Compose Broadcast"
        display={isBroadcastModalOpen}
        close={() => setIsBroadcastModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* MultiSelect Element for Recipients in Modal */}
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
                  Selected Preview ({selectedCount})
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
                      onClick={() => toggleSelectPerson(p)}
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
                  ? `Send message (${selectedCount})`
                  : "Send message"
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

      {/* Recipient Details View Modal */}
      <SidebarModal
        title="Recipient Details"
        display={isModalOpen}
        close={() => setIsModalOpen(false)}
      >
        {selectedPerson && (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
                {selectedPerson.firstName
                  ? selectedPerson.firstName.charAt(0).toUpperCase()
                  : selectedPerson.name
                    ? selectedPerson.name.charAt(0).toUpperCase()
                    : "?"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selectedPerson.name ||
                    `${selectedPerson.firstName} ${selectedPerson.lastName}`.trim() || (
                      <NotAvailable />
                    )}
                </h3>
                <div className="mt-1">
                  <StatusBadge
                    status={selectedPerson.membershipStatus}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Email Address
                  </span>
                  {selectedPerson.email ? (
                    <a
                      href={`mailto:${selectedPerson.email}`}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                    >
                      {selectedPerson.email}
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
                  {selectedPerson.phone ? (
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedPerson.phone}
                    </span>
                  ) : (
                    <NotAvailable />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Gender
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {selectedPerson.gender || <NotAvailable />}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-200/80 dark:border-zinc-800 pt-5">
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
    </div>
  );
}
