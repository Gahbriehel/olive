import { type IQueryParams } from "@/models/base";

export interface Option {
  label: string;
  value: string;
}

// Params owned by the list itself (pagination + table search), not the
// filters panel.
type ListParamKey = "page" | "limit" | "search";

export type FilterKey = Exclude<keyof IQueryParams, ListParamKey>;

export type BooleanFilterKey = {
  [K in FilterKey]-?: NonNullable<IQueryParams[K]> extends boolean ? K : never;
}[FilterKey];

export type StringFilterKey = {
  [K in FilterKey]-?: NonNullable<IQueryParams[K]> extends string ? K : never;
}[FilterKey];

// Filter values are held as strings while in the panel; "" (or a missing
// key) means "no filter". Boolean fields use "true" / "false".
export type FilterValues = Partial<Record<FilterKey, string>>;

export type FilterField =
  | {
      type: "select";
      key: StringFilterKey;
      label: string;
      options: Option[];
      allLabel?: string;
    }
  | {
      type: "text";
      key: StringFilterKey;
      label: string;
      placeholder?: string;
    }
  | {
      type: "boolean";
      key: BooleanFilterKey;
      label: string;
      trueLabel: string;
      falseLabel: string;
      allLabel?: string;
    }
  | {
      type: "dateRange";
      label?: string;
      presets?: boolean;
    };

export function isFieldActive(field: FilterField, values: FilterValues) {
  if (field.type === "dateRange") {
    return Boolean(values.startDate || values.endDate);
  }
  return Boolean(values[field.key]?.trim());
}

export function countActiveFilters(
  fields: FilterField[],
  values: FilterValues,
): number {
  return fields.filter((field) => isFieldActive(field, values)).length;
}

export function filterValuesToQueryParams(
  fields: FilterField[],
  values: FilterValues,
): IQueryParams {
  const params: IQueryParams = {};
  for (const field of fields) {
    if (field.type === "dateRange") {
      if (values.startDate) params.startDate = values.startDate;
      if (values.endDate) params.endDate = values.endDate;
    } else if (field.type === "boolean") {
      const value = values[field.key];
      if (value) params[field.key] = value === "true";
    } else {
      const value = values[field.key]?.trim();
      if (value) params[field.key] = value;
    }
  }
  return params;
}
