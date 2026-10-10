import type { JSX } from "react";

import { cn } from "@/helpers/cn";

interface Props {
  message: string;
  /** Pair with the control's `aria-describedby`. */
  id?: string;
  className?: string;
}

/** In-flow field error. Prefer `FormField`'s `error` prop for new code. */
export function ErrorMessage({ message, id, className }: Props): JSX.Element {
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-xs font-medium text-rose-500", className)}
    >
      {message}
    </p>
  );
}
