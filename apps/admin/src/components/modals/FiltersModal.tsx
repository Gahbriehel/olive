import { type JSX, useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Controller, useForm } from "react-hook-form";

dayjs.extend(utc);

import { Input } from "@/components/FormElements/Input";
import { Select, type ISelect } from "@/components/ui/Select";
import { BaseButton } from "@/components/ui/Button";
import { SidebarModal } from "@/components/ui/SidebarModal";
import { type IQueryParams } from "@/models/base";

export interface Option {
  label: string;
  value: string;
}

interface Inputs {
  startDate: string;
  endDate: string;
  search: string;
  status: ISelect;
  eventId: ISelect;
  teamId: ISelect;
  membershipStatus: ISelect;
}

interface Props {
  values: IQueryParams;
  display: boolean;
  close: () => void;
  filters: Array<keyof IQueryParams | "date">;
  resetFilters?: () => void;
  applyFilters: (filters: IQueryParams) => void;
  eventOptions?: Option[];
  teamOptions?: Option[];
  statusOptions?: Option[];
  membershipStatusOptions?: Option[];
}

const mapToISelect = (val?: string, options?: Option[]): ISelect => {
  if (!val) return { value: { _id: "" }, label: "" };
  const opt = options?.find((o) => o.value === val);
  return {
    value: { _id: val },
    label: opt ? opt.label : val,
  };
};

const emptyDefaultValues: Inputs = {
  startDate: "",
  endDate: "",
  search: "",
  status: { value: { _id: "" }, label: "" },
  eventId: { value: { _id: "" }, label: "" },
  teamId: { value: { _id: "" }, label: "" },
  membershipStatus: { value: { _id: "" }, label: "" },
};

export function FiltersModal(props: Props): JSX.Element {
  const { display, close } = props;

  return (
    <SidebarModal title="Filters" display={display} close={close}>
      {display ? <FiltersModalContent {...props} /> : <div></div>}
    </SidebarModal>
  );
}

function FiltersModalContent({
  values,
  filters,
  resetFilters,
  applyFilters,
  eventOptions = [],
  teamOptions = [],
  statusOptions = [],
  membershipStatusOptions = [],
}: Props): JSX.Element {
  const defaultValues: Inputs = useMemo(() => {
    return {
      startDate: values.startDate ?? "",
      endDate: values.endDate ?? "",
      search: values.search ?? "",
      status: mapToISelect(values.status, statusOptions),
      eventId: mapToISelect(values.eventId, eventOptions),
      teamId: mapToISelect(values.teamId, teamOptions),
      membershipStatus: mapToISelect(
        values.membershipStatus,
        membershipStatusOptions,
      ),
    };
  }, [
    values,
    eventOptions,
    teamOptions,
    statusOptions,
    membershipStatusOptions,
  ]);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    values: defaultValues,
  });

  function onSubmit(data: Inputs): void {
    if (
      data.startDate &&
      data.endDate &&
      dayjs(data.endDate).isBefore(data.startDate)
    ) {
      setError("endDate", {
        message: "End date must be after start date",
      });
      return;
    }
    const queryParams: IQueryParams = {
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      search: data.search || undefined,
      status: data.status?.value?._id || undefined,
      eventId: data.eventId?.value?._id || undefined,
      teamId: data.teamId?.value?._id || undefined,
      membershipStatus: data.membershipStatus?.value?._id || undefined,
    };
    applyFilters(queryParams);
  }

  function setToday(): void {
    setValue("startDate", dayjs().format("YYYY-MM-DD"));
    setValue("endDate", dayjs().format("YYYY-MM-DD"));
  }
  function setLast7Days(): void {
    setValue("startDate", dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    setValue("endDate", dayjs().format("YYYY-MM-DD"));
  }
  function setThisMonth(): void {
    setValue("startDate", dayjs().startOf("month").format("YYYY-MM-DD"));
    setValue("endDate", dayjs().endOf("month").format("YYYY-MM-DD"));
  }
  function setLast3Months(): void {
    setValue("startDate", dayjs().subtract(3, "month").format("YYYY-MM-DD"));
    setValue("endDate", dayjs().format("YYYY-MM-DD"));
  }

  const presets = [
    { label: "Today", dateFunction: setToday },
    { label: "Last 7 Days", dateFunction: setLast7Days },
    { label: "This Month", dateFunction: setThisMonth },
    { label: "Last 3 Months", dateFunction: setLast3Months },
  ] as const;

  const selectOptionsMapped = useMemo(() => {
    return {
      status: statusOptions.map((opt) => ({
        value: { _id: opt.value },
        label: opt.label,
      })),
      eventId: eventOptions.map((opt) => ({
        value: { _id: opt.value },
        label: opt.label,
      })),
      teamId: teamOptions.map((opt) => ({
        value: { _id: opt.value },
        label: opt.label,
      })),
      membershipStatus: membershipStatusOptions.map((opt) => ({
        value: { _id: opt.value },
        label: opt.label,
      })),
    };
  }, [statusOptions, eventOptions, teamOptions, membershipStatusOptions]);

  const showDateFields =
    filters.includes("date") ||
    filters.includes("startDate") ||
    filters.includes("endDate");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col overflow-hidden"
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-1">
        {showDateFields && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-wrap">
              {presets.map((preset) => (
                <button
                  key={encodeURI(preset.label)}
                  onClick={preset.dateFunction}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold duration-300 hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 md:px-4 cursor-pointer"
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Start Date"
                    type="date"
                    error={errors.startDate?.message}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="End Date"
                    type="date"
                    error={errors.endDate?.message}
                  />
                )}
              />
            </div>
          </>
        )}

        {filters.includes("search") && (
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Search Keyword"
                placeholder="Search..."
                error={errors.search?.message}
              />
            )}
          />
        )}

        {filters.includes("status") && (
          <Controller
            name="status"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <Select
                label="Status"
                placeholder="Select status..."
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                options={selectOptionsMapped.status}
                validationError={errors.status?.message}
              />
            )}
          />
        )}

        {filters.includes("eventId") && (
          <Controller
            name="eventId"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <Select
                label="Event"
                placeholder="Select event..."
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                options={selectOptionsMapped.eventId}
                validationError={errors.eventId?.message}
              />
            )}
          />
        )}

        {filters.includes("teamId") && (
          <Controller
            name="teamId"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <Select
                label="Team"
                placeholder="Select team..."
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                options={selectOptionsMapped.teamId}
                validationError={errors.teamId?.message}
              />
            )}
          />
        )}

        {filters.includes("membershipStatus") && (
          <Controller
            name="membershipStatus"
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <Select
                label="Membership Status"
                placeholder="Select membership status..."
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                options={selectOptionsMapped.membershipStatus}
                validationError={errors.membershipStatus?.message}
              />
            )}
          />
        )}
      </div>

      <fieldset className="grid h-20 grid-cols-2 gap-4 border-t border-slate-100 p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 mt-6">
        <BaseButton
          text="Clear All"
          type="button"
          color="outline"
          onClick={() => {
            reset(emptyDefaultValues);
            resetFilters?.();
          }}
        />
        <BaseButton text="Apply Filters" type="submit" color="primary" />
      </fieldset>
    </form>
  );
}
