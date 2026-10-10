import {
  type JSX,
  type ReactNode,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";

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
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { SelectPagination } from "@/components/FormElements/SelectPagination";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";

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
  /** id for the input; generated when omitted. */
  id?: string;
  /** Helper text under the control, linked via aria-describedby. */
  hint?: ReactNode;
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
    id: idProp,
    hint,
  }: Props,
  ref,
): JSX.Element {
  const { id, hintId, errorId } = useFieldIds(idProp);
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

  const errorText =
    typeof validationError === "string"
      ? validationError
      : validationError?.message;
  const aria = fieldAria({ errorId, hintId, error: errorText, hint });
  const hasValue = !!value?.value?._id;
  const showClear = !disabled && !isLoading && !!closeIconFn && hasValue;
  const showChevron = !disabled && !isLoading && !showClear;
  const totalCount: number | undefined = queryResult?.data?.totalCount;
  const limit = queryParams.limit ?? defaultLimit;

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={errorText}
      className={cn("relative", className)}
    >
      <Combobox
        value={value}
        onChange={handleChange}
        disabled={disabled}
        immediate
        onClose={() => setQuery("")}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <ComboboxInput
              ref={ref}
              id={id}
              aria-required={required || undefined}
              {...aria}
              className={cn(
                controlClass,
                "cursor-pointer pr-10 capitalize",
                errorText && controlErrorClass,
              )}
              onChange={(event) => {
                if (disabled) return;
                setQuery(event.target.value);
              }}
              displayValue={(val: ISelect) => val?.label ?? ""}
              placeholder={placeholder ?? "Start typing to search..."}
              onBlur={onBlur}
            />

            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2.5">
              {isLoading && <Spinner size="xs" label="Loading options" />}
              {showClear && (
                <button
                  type="button"
                  aria-label={label ? `Clear ${label}` : "Clear selection"}
                  onClick={(e) => {
                    e.preventDefault();
                    closeIconFn?.();
                  }}
                  className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {showChevron && (
                <ComboboxButton
                  aria-label={label ? `Show ${label} options` : "Show options"}
                  className="rounded p-0.5 text-fg-subtle focus:outline-none"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </ComboboxButton>
              )}
            </div>

            <ComboboxOptions
              transition
              className={cn(
                "absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-surface-raised py-1 text-sm shadow-lg ring-1 ring-border-control focus:outline-none",
                "transition duration-100 ease-in data-[closed]:opacity-0",
                optionsClassName,
              )}
            >
              {queryHook && queryResult?.data && (
                <SelectPagination
                  currentPage={queryParams.page ?? 1}
                  totalCount={totalCount}
                  limit={limit}
                  hasNextPage={transformedOptions.length >= limit}
                  onPageChange={(page) =>
                    setQueryParams((prev) => ({ ...prev, page }))
                  }
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
              {!isLoading && filteredOptions?.length === 0 && query !== "" && (
                <div className="relative cursor-default select-none px-4 py-2.5 text-sm text-fg-muted">
                  Nothing found.
                </div>
              )}
              {!isLoading &&
                (options?.length || availableOptions?.length) === 0 && (
                  <div className="relative cursor-default select-none px-4 py-2.5 text-sm text-fg-muted">
                    No options.
                  </div>
                )}
              {isLoading && (
                <div className="relative cursor-default select-none px-4 py-2.5 text-sm text-fg-muted">
                  Loading...
                </div>
              )}
              {filteredOptions.length > 0 &&
                filteredOptions.map((option, index) => (
                  <ComboboxOption
                    key={option.value?._id || index}
                    className="group relative flex cursor-pointer select-none items-center py-2.5 pl-10 pr-4 text-fg data-[focus]:bg-primary-soft data-[focus]:text-fg dark:data-[focus]:bg-primary/10"
                    value={option}
                  >
                    {({ selected }) => {
                      const isSelected =
                        selected || value?.value?._id === option.value._id;
                      return (
                        <>
                          <span
                            className={cn(
                              "block truncate capitalize",
                              isSelected
                                ? "font-semibold text-primary-text"
                                : "font-normal",
                            )}
                          >
                            {option.label}
                          </span>
                          {isSelected && (
                            <Check
                              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-text"
                              aria-hidden="true"
                            />
                          )}
                          <div className="ml-auto opacity-0 group-hover:opacity-100 group-data-[focus]:opacity-100">
                            {itemRight?.(option)}
                          </div>
                        </>
                      );
                    }}
                  </ComboboxOption>
                ))}
            </ComboboxOptions>
          </div>
          {icon}
        </div>
      </Combobox>
    </FormField>
  );
});
