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
      hint,
      leftIcon,
      required,
      children,
      ...props
    },
    ref,
  ) => {
    const { id, hintId, errorId } = useFieldIds(idProp);
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
