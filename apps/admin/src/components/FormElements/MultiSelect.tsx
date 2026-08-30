/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, type JSX, type ReactNode, useMemo, useState } from "react";

import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown, PlusCircle, Search, XCircle } from "lucide-react";
import { type FieldError } from "react-hook-form";
import { ClipLoader } from "react-spinners";

import { cn } from "@/helpers/cn";
import { emptySelect } from "@/helpers/emptySelect";
import { truncateString } from "@/helpers/truncateString";
import { useDebounce } from "@/hooks/useDebounce";
import { type IQueryParams } from "@/models/base";
import { type ISelect } from "@/components/ui/Select";

import { ErrorMessage } from "./ErrorMessage";
import { ReadOnlyField } from "./ReadOnlyField";
import { SelectPagination } from "./SelectPagination";

interface Props {
  value: ISelect[];
  onChange: (value: ISelect[]) => void;
  onBlur?: any;
  label: string;
  placeholder?: string;
  options?: ISelect[];
  validationError?: FieldError;
  loading?: boolean;
  required?: boolean;
  closeIconFn?: () => void;
  icon?: ReactNode;
  itemRight?: (option: ISelect) => ReactNode;
  addNewOption?: () => void;
  queryHook?: (params: IQueryParams) => {
    data?: any;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  dataKey?: string;
  transformData?: (item: any) => ISelect;
  defaultLimit?: number;
  viewMode?: boolean;
}

export function MultiSelect({
  value,
  onChange,
  onBlur,
  label,
  options = [],
  validationError,
  placeholder,
  loading,
  required,
  closeIconFn,
  icon,
  itemRight,
  addNewOption,
  queryHook,
  dataKey = "paginatedData",
  defaultLimit = 20,
  transformData,
  viewMode,
}: Props): JSX.Element {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [prevQuery, setPrevQuery] = useState(debouncedQuery);
  const [page, setPage] = useState(1);
  if (debouncedQuery !== prevQuery) {
    setPrevQuery(debouncedQuery);
    setPage(1);
  }

  const queryParams = useMemo<IQueryParams>(
    () => ({
      page,
      limit: defaultLimit,
      name: debouncedQuery,
    }),
    [page, defaultLimit, debouncedQuery],
  );

  const queryResult = queryHook ? queryHook(queryParams) : null;

  const transformedOptions = useMemo(() => {
    if (!queryHook || !queryResult?.data) return [];

    const dataArray =
      dataKey.split(".").reduce((obj, key) => obj?.[key], queryResult.data) ||
      [];

    if (!Array.isArray(dataArray)) return [];

    return dataArray.map((item) => {
      if (transformData) {
        return transformData(item);
      }
      return {
        value: { _id: item._id || item.id },
        label: item.name || item.label || item.title || "",
      };
    });
  }, [queryHook, queryResult, dataKey, transformData]);

  const availableOptions = queryHook ? transformedOptions : options;
  const filteredOptions = useMemo(() => {
    if (queryHook) {
      return availableOptions;
    }

    return query === ""
      ? availableOptions
      : availableOptions.filter((option) => {
          return option.label?.toLowerCase().includes(query?.toLowerCase());
        });
  }, [queryHook, availableOptions, query]);

  const isLoading = queryHook ? queryResult?.isLoading : loading;

  if (viewMode) {
    return (
      <ReadOnlyField
        label={label}
        value={
          value?.length ? (
            <span className="flex flex-wrap gap-1.5">
              {value.map((option) => (
                <span
                  key={option.value._id || option.label}
                  className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {option.label}
                </span>
              ))}
            </span>
          ) : (
            ""
          )
        }
      />
    );
  }

  const sortedFilteredOptions = queryHook
    ? filteredOptions
    : filteredOptions.sort((a, b) =>
        (a.label ?? "").localeCompare(b.label ?? ""),
      );

  const handleChange = (selectedValues: ISelect[]): void => {
    const hasAddNewOption = selectedValues.some(
      (v) => v?.value?._id === "" && v?.label === "",
    );

    if (hasAddNewOption && addNewOption) {
      addNewOption();
      return;
    }

    onChange(selectedValues);
  };

  return (
    <fieldset className="relative space-y-2">
      <Listbox value={value} onChange={handleChange} multiple>
        <Listbox.Label className="block text-sm font-semibold text-gray-600 dark:text-slate-300">
          {label} {required && <span className="text-red-600">*</span>}{" "}
          {value?.length > 0 && (
            <span className="text-gray-400">{`(${value?.length}) selected`}</span>
          )}
        </Listbox.Label>
        <div className="relative mt-3">
          <Listbox.Button className="w-full text-left">
            <div className="flex h-10 w-full items-center justify-between rounded-xl border bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span
                className={cn({
                  "text-gray-400 dark:text-slate-500": !value?.length,
                })}
              >
                {value && value.length > 0
                  ? truncateString(value.map((v) => v.label).join(", "), 40)
                  : (placeholder ?? "Select options...")}
              </span>
              <div className="flex items-center gap-2">
                {isLoading && <ClipLoader size={12} />}
                {!isLoading && closeIconFn && !!value?.length && (
                  <XCircle
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeIconFn();
                    }}
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  />
                )}
                <ChevronDown
                  className="h-5 w-5 text-gray-400 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </div>
          </Listbox.Button>

          <input
            type="text"
            className="sr-only"
            onBlur={onBlur}
            tabIndex={-1}
          />
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              setQuery("");
            }}
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 dark:shadow-slate-900/50 dark:ring-slate-700 sm:text-sm">
              <div className="sticky -top-1 z-20 border-b border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name={label + "search"}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
                    placeholder="Search options..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </div>
              </div>

              {queryHook && queryResult?.data && (
                <SelectPagination
                  currentPage={queryParams.page ?? 1}
                  totalCount={queryResult.data.totalCount ?? 0}
                  limit={queryParams.limit ?? defaultLimit}
                  onPageChange={(page) => {
                    setPage(page);
                  }}
                />
              )}
              {addNewOption && (
                <Listbox.Option
                  value={emptySelect()}
                  className="flex cursor-pointer items-center gap-2 px-10 py-2.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Add new</span>
                    <PlusCircle className="h-4 w-4 shrink-0" />
                  </div>
                </Listbox.Option>
              )}
              {!isLoading &&
                sortedFilteredOptions?.length === 0 &&
                query !== "" && (
                  <div className="relative cursor-default select-none px-10 py-2 text-gray-700 dark:text-slate-400">
                    Nothing found.
                  </div>
                )}
              {!isLoading &&
                (options?.length || availableOptions?.length) === 0 && (
                  <div className="relative cursor-default select-none px-10 py-2 text-gray-700 dark:text-slate-400">
                    No options.
                  </div>
                )}
              {isLoading && (
                <div className="relative cursor-default select-none px-10 py-2 text-gray-700 dark:text-slate-400">
                  Loading...
                </div>
              )}
              {sortedFilteredOptions.length > 0 &&
                sortedFilteredOptions.map((option, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `group relative flex cursor-pointer select-none items-center py-2.5 pl-10 pr-4 ${
                        active
                          ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100"
                          : "text-gray-900 dark:text-slate-100"
                      }`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn("block truncate capitalize", {
                            "font-semibold text-indigo-600 dark:text-indigo-400":
                              selected,
                            "font-normal": !selected,
                          })}
                        >
                          {option.label}
                        </span>
                        {(selected ||
                          value
                            ?.map((v) => v.value?._id)
                            .includes(option.value?._id as string)) && (
                          <Check
                            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-600 dark:text-indigo-400"
                            aria-hidden="true"
                          />
                        )}
                        <div className="ml-auto opacity-0 group-hover:opacity-100">
                          {itemRight?.(option)}
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
        {icon}
      </Listbox>
      {validationError && (
        <ErrorMessage message={validationError.message ?? ""} />
      )}
    </fieldset>
  );
}
