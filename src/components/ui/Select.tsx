import {
  Fragment,
  type JSX,
  type ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Combobox, Transition } from "@headlessui/react";
import { Check, ChevronDown, PlusCircle, XCircle } from "lucide-react";
import { type FieldError } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { clsx } from "clsx";

import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export interface ISelect {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: { _id: string; [key: string]: any };
  label: string;
}

export interface IQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const emptySelect = (): ISelect => ({ value: { _id: "" }, label: "" });

interface Props {
  value: ISelect;
  label?: string;
  placeholder?: string;
  options?: ISelect[];
  validationError?: FieldError | string;
  loading?: boolean;
  fetchError?: boolean;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onBlur?: () => void;
  onChange: (value: ISelect) => void;
  itemRight?: (option: ISelect) => ReactNode;
  closeIconFn?: () => void;
  addNewOption?: () => void;
  queryHook?: (params: IQueryParams) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  dataKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformData?: (item: any) => ISelect;
  defaultLimit?: number;
  optionsClassName?: string;
  className?: string;
}

export const Select = forwardRef<HTMLInputElement, Props>(function Select(
  {
    value,
    label,
    options = [],
    validationError,
    placeholder,
    loading,
    required,
    disabled = false,
    icon,
    dataKey = "paginatedData",
    defaultLimit = 20,
    closeIconFn,
    onChange,
    onBlur,
    itemRight,
    addNewOption,
    queryHook,
    transformData,
    optionsClassName,
    className,
  }: Props,
  ref,
): JSX.Element {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query, 300);

  const [queryParams, setQueryParams] = useState<IQueryParams>({
    page: 1,
    limit: defaultLimit,
    name: "",
  });

  const queryResult = queryHook ? queryHook(queryParams) : null;

  useEffect(() => {
    if (queryHook) {
      setQueryParams((prev) => ({
        ...prev,
        name: debouncedQuery,
        page: 1,
      }));
    }
  }, [debouncedQuery, queryHook]);

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
  }, [queryHook, queryResult?.data, dataKey, transformData]);

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

  const handleChange = (selectedValue: ISelect | null): void => {
    if (disabled || !selectedValue) return;
    if (
      addNewOption &&
      selectedValue?.value?._id === "" &&
      selectedValue?.label === ""
    ) {
      addNewOption();
      return;
    }
    onChange(selectedValue);
  };

  return (
    <fieldset className={clsx("relative space-y-1.5 w-full", className)}>
      <Combobox value={value} onChange={handleChange} disabled={disabled}>
        {label && (
          <Combobox.Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500 ml-1">*</span>}
          </Combobox.Label>
        )}
        <div className="relative flex items-center gap-2">
          <Combobox.Button as="div" className="w-full relative">
            <Combobox.Input
              ref={ref}
              disabled={disabled}
              className={clsx(
                "w-full text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 min-h-[42px] capitalize",
                disabled &&
                  "pointer-events-none cursor-not-allowed bg-slate-50 opacity-60 dark:bg-zinc-800/50",
              )}
              onChange={(event) => {
                if (disabled) return;
                setQuery(event.target.value);
              }}
              displayValue={(val: ISelect) => val?.label ?? ""}
              placeholder={placeholder ?? "Start typing to search..."}
              onBlur={onBlur}
            />

            {!disabled &&
              ((!isLoading && !closeIconFn) ||
                (closeIconFn && !value?.value?._id)) && (
                <ChevronDown
                  className={clsx(
                    "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500",
                    {
                      "right-3.5": !icon,
                      "right-12": icon,
                    },
                  )}
                  aria-hidden="true"
                />
              )}

            {!disabled && !isLoading && closeIconFn && value?.value?._id && (
              <XCircle
                onClick={(e) => {
                  e.preventDefault();
                  closeIconFn();
                }}
                className={clsx(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors",
                  {
                    "right-3.5": !icon,
                    "right-12": icon,
                  },
                )}
                aria-hidden="true"
              />
            )}
            {isLoading && (
              <div
                className={clsx(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500",
                  {
                    "right-3.5": !icon,
                    "right-8": icon,
                  },
                )}
              >
                <ClipLoader size={12} color="currentColor" />
              </div>
            )}
          </Combobox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              setQuery("");
            }}
          >
            <Combobox.Options
              className={clsx(
                "absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-slate-900/5 focus:outline-none dark:bg-zinc-800 dark:shadow-zinc-950/50 dark:ring-zinc-700",
                optionsClassName,
              )}
            >
              {queryHook &&
                queryResult?.data &&
                queryResult.data.totalCount >
                  (queryParams.limit ?? defaultLimit) && (
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-700 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/50">
                    <span>Page {queryParams.page ?? 1}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={(queryParams.page ?? 1) <= 1}
                        onClick={() =>
                          setQueryParams((prev) => ({
                            ...prev,
                            page: Math.max(1, (prev.page ?? 1) - 1),
                          }))
                        }
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={
                          (queryParams.page ?? 1) *
                            (queryParams.limit ?? defaultLimit) >=
                          (queryResult.data.totalCount ?? 0)
                        }
                        onClick={() =>
                          setQueryParams((prev) => ({
                            ...prev,
                            page: (prev.page ?? 1) + 1,
                          }))
                        }
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              {addNewOption && (
                <Combobox.Option
                  value={emptySelect()}
                  className="flex cursor-pointer items-center gap-2 px-10 py-2.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <span className="font-medium">Add new</span>
                  <PlusCircle className="h-4 w-4 shrink-0" />
                </Combobox.Option>
              )}
              {!isLoading && filteredOptions?.length === 0 && query !== "" && (
                <div className="relative cursor-default select-none px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm">
                  Nothing found.
                </div>
              )}
              {!isLoading &&
                (options?.length || availableOptions?.length) === 0 && (
                  <div className="relative cursor-default select-none px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm">
                    No options.
                  </div>
                )}
              {isLoading && (
                <div className="relative cursor-default select-none px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm">
                  Loading...
                </div>
              )}
              {filteredOptions.length > 0 &&
                filteredOptions.map((option, index) => (
                  <Combobox.Option
                    key={index}
                    className={({ active }) =>
                      `group relative flex cursor-pointer select-none items-center py-2.5 pl-10 pr-4 ${
                        active
                          ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-100"
                          : "text-slate-900 dark:text-slate-100"
                      }`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx("block truncate capitalize", {
                            "font-semibold text-indigo-600 dark:text-indigo-400":
                              selected,
                            "font-normal": !selected,
                          })}
                        >
                          {option.label}
                        </span>
                        {(selected ||
                          value?.value?._id === option.value._id) && (
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
                  </Combobox.Option>
                ))}
            </Combobox.Options>
          </Transition>
          {icon}
        </div>
      </Combobox>
      {validationError && (
        <p className="text-xs text-rose-500 mt-0.5">
          {typeof validationError === "string"
            ? validationError
            : (validationError.message ?? "")}
        </p>
      )}
    </fieldset>
  );
});
