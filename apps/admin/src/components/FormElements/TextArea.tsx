import {
  forwardRef,
  type DetailedHTMLProps,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/helpers/cn";
import {
  FormField,
  controlClass,
  controlErrorClass,
  fieldAria,
  useFieldIds,
} from "@/components/ui/FormField";

interface Props extends DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> {
  label?: string;
  error?: string;
  required?: boolean;
  /** Helper text under the control, linked via aria-describedby. */
  hint?: ReactNode;
  /** Class for the outer field wrapper (label + control + messages). */
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  function TextArea(
    {
      id: idProp,
      label,
      error,
      hint,
      required,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) {
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
        <textarea
          {...props}
          ref={ref}
          id={id}
          aria-required={required || undefined}
          aria-invalid={aria["aria-invalid"] ?? props["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          className={cn(
            controlClass,
            "min-h-[120px] resize-y",
            error && controlErrorClass,
            className,
          )}
        />
      </FormField>
    );
  },
);
