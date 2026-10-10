/* eslint-disable @typescript-eslint/no-explicit-any */
import { type JSX, type ReactNode, useMemo, useState } from "react";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown, PlusCircle, XCircle } from "lucide-react";
import { type FieldError } from "react-hook-form";

import { cn } from "@/helpers/cn";
import { emptySelect } from "@/helpers/emptySelect";
import { truncateString } from "@/helpers/truncateString";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { type IQueryParams } from "@/models/base";
import { type ISelect } from "@/components/ui/Select";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";

import { ReadOnlyField } from "./ReadOnlyField";
import { SelectPagination } from "./SelectPagination";

interface Props {
  value: ISelect[];
  onChange: (value: ISelect[]) => void;
  onBlur?: any;
  label: string;
  placeholder?: string;
  options?: ISelect[];
  validationError?: FieldError | string;
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
  /** id for the search input; generated when omitted. */
  id?: string;
  /** Helper text under the control, linked via aria-describedby. */
  hint?: ReactNode;
  disabled?: boolean;
}

const sameOption = (a: ISelect, b: ISelect): boolean =>
  a?.value?._id === b?.value?._id;

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
  id: idProp,
  hint,
  disabled = false,
}: Props): JSX.Element {
  const { id, hintId, errorId } = useFieldIds(idProp);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query, 300);

  // Reset to the first page whenever the (debounced) search changes.
  const [prevQuery, setPrevQuery] = useState(debouncedQuery);
  const [page, setPage] = useState(1);
  if (debouncedQuery !== prevQuery) {
    setPrevQuery(debouncedQuery);
    setPage(1);
  }

  const queryParams = useMemo<IQueryParams & { name?: string }>(
    () => ({
      page,
      limit: defaultLimit,
      name: debouncedQuery,
    }),
    [page, defaultLimit, debouncedQuery],
  );

  const queryResult = queryHook ? queryHook(queryParams) : null;

  const transformedOptions = useMemo<ISelect[]>(() => {
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
  const visibleOptions = useMemo(() => {
    if (queryHook) return availableOptions;

    const q = query.toLowerCase();
    return availableOptions
      .filter((option) => q === "" || option.label?.toLowerCase().includes(q))
      .sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""));
  }, [queryHook, availableOptions, query]);

  const isLoading = queryHook ? queryResult?.isLoading : loading;

  if (viewMode) {
    return (
      <ReadOnlyField
        id={idProp}
        label={label}
        value={
          value?.length ? (
            <span className="flex flex-wrap gap-1.5">
              {value.map((option) => (
                <span
                  key={option.value._id || option.label}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-fg-secondary"
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

  const handleChange = (selectedValues: ISelect[]): void => {
    const hasAddNewOption = selectedValues.some(
      (v) => v?.value?._id === "" && v?.label === "",
    );

    if (hasAddNewOption) {
      addNewOption?.();
      return;
    }

    onChange(selectedValues);
  };

  const errorText =
    typeof validationError === "string"
      ? validationError
      : validationError?.message;
  const aria = fieldAria({ errorId, hintId, error: errorText, hint });
  const selectedCount = value?.length ?? 0;
  const summary = selectedCount
    ? truncateString(value.map((v) => v.label).join(", "), 40)
    : undefined;
  const showClear =
    !disabled && !isLoading && !!closeIconFn && selectedCount > 0;
  const totalCount: number | undefined = queryResult?.data?.totalCount;

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={errorText}
      labelSuffix={
        selectedCount > 0 && (
          <span className="ml-1 font-normal text-fg-subtle">
            ({selectedCount} selected)
          </span>
        )
      }
    >
      <Combobox
        value={value ?? []}
        onChange={handleChange}
        multiple
        by={sameOption}
        disabled={disabled}
        immediate
        onClose={() => setQuery("")}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <ComboboxInput
              id={id}
              aria-required={required || undefined}
              {...aria}
              autoComplete="off"
              className={cn(
                controlClass,
                "pr-16",
                // When something is selected and the user is not typing, the
                // placeholder doubles as the selection summary.
                summary && "placeholder:text-fg",
                errorText && controlErrorClass,
              )}
              placeholder={summary ?? placeholder ?? "Select options..."}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={onBlur}
            />

            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2.5">
              {isLoading && <Spinner size="xs" label="Loading options" />}
              {showClear && (
                <button
                  type="button"
                  aria-label={`Clear all ${label}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeIconFn?.();
                  }}
                  className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <ComboboxButton
                aria-label={`Show ${label} options`}
                className="rounded p-0.5 text-fg-subtle focus:outline-none"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </ComboboxButton>
            </div>

            <ComboboxOptions
              transition
              className="absolute top-full z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-surface-raised py-1 text-sm shadow-lg ring-1 ring-border-control transition duration-100 ease-in focus:outline-none data-[closed]:opacity-0"
            >
              {queryHook && queryResult?.data && (
                <SelectPagination
                  currentPage={page}
                  totalCount={totalCount}
                  limit={defaultLimit}
                  hasNextPage={transformedOptions.length >= defaultLimit}
                  onPageChange={setPage}
                />
              )}
              {addNewOption && (
                <ComboboxOption
                  value={emptySelect()}
                  className="flex cursor-pointer items-center gap-2 px-10 py-2.5 text-primary-text data-[focus]:bg-primary-soft"
                >
                  <span className="font-medium">Add new</span>
                  <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                </ComboboxOption>
              )}
              {!isLoading && visibleOptions.length === 0 && query !== "" && (
                <div className="cursor-default select-none px-4 py-2.5 text-fg-muted">
                  Nothing found.
                </div>
              )}
              {!isLoading && availableOptions.length === 0 && query === "" && (
                <div className="cursor-default select-none px-4 py-2.5 text-fg-muted">
                  No options.
                </div>
              )}
              {isLoading && (
                <div className="cursor-default select-none px-4 py-2.5 text-fg-muted">
                  Loading...
                </div>
              )}
              {visibleOptions.map((option, index) => (
                <ComboboxOption
                  key={option.value?._id || index}
                  value={option}
                  className="group relative flex cursor-pointer select-none items-center py-2.5 pl-10 pr-4 text-fg data-[focus]:bg-primary-soft data-[focus]:text-fg dark:data-[focus]:bg-primary/10"
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate capitalize",
                          selected
                            ? "font-semibold text-primary-text"
                            : "font-normal",
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <Check
                          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-text"
                          aria-hidden="true"
                        />
                      )}
                      <div className="ml-auto opacity-0 group-hover:opacity-100 group-data-[focus]:opacity-100">
                        {itemRight?.(option)}
                      </div>
                    </>
                  )}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </div>
          {icon}
        </div>
      </Combobox>
    </FormField>
  );
}
