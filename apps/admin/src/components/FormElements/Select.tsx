import React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/helpers/cn";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  /** Helper text under the control, linked via aria-describedby. */
  hint?: React.ReactNode;
  /** Rendered after the label, e.g. an `InfoTip`. */
  labelSuffix?: React.ReactNode;
  /**
   * One line of context per option value. The entry for the current value is
   * shown as the hint unless an explicit `hint` is passed. Native `<option>`
   * can't hold two lines, so keep option text short and describe it here.
   */
  descriptions?: Record<string, string>;
  /** Class for the outer field wrapper (label + control + messages). */
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id: idProp,
      className,
      containerClassName,
      label,
      error,
      hint: hintProp,
      labelSuffix,
      descriptions,
      leftIcon,
      required,
      children,
      ...props
    },
    ref,
  ) => {
    const { id, hintId, errorId } = useFieldIds(idProp);
    const current = props.value ?? props.defaultValue;
    const hint =
      hintProp ??
      (current !== undefined && current !== ""
        ? descriptions?.[String(current)]
        : undefined);
    const aria = fieldAria({
      errorId,
      hintId,
      error,
      hint,
      describedBy: props["aria-describedby"],
    });

    return (
      <FormField
        id={id}
        label={label}
        labelSuffix={labelSuffix}
        required={required}
        hint={hint}
        error={error}
        className={containerClassName}
      >
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-fg-subtle">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            required={required}
            {...props}
            aria-invalid={aria["aria-invalid"] ?? props["aria-invalid"]}
            aria-describedby={aria["aria-describedby"]}
            className={cn(
              controlClass,
              "cursor-pointer appearance-none pr-10",
              leftIcon && "pl-10",
              error && controlErrorClass,
              className,
            )}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 h-4 w-4 text-fg-subtle"
          />
        </div>
      </FormField>
    );
  },
);

Select.displayName = "Select";
