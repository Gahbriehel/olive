import { Loader2 } from "lucide-react";
import { cn } from "@/helpers/cn";

const sizes = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

interface SpinnerProps {
  size?: keyof typeof sizes;
  /** Colour comes from the text colour; defaults to the brand accent. */
  className?: string;
  /** Accessible label; omit when a visible label sits next to the spinner. */
  label?: string;
}

/** The only loading indicator in the admin app. */
export function Spinner({ size = "sm", className, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "shrink-0 animate-spin text-indigo-600 dark:text-indigo-400",
        sizes[size],
        className,
      )}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** Centred spinner + caption for full-area loading states. */
export function LoadingState({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-12 text-center",
        className,
      )}
    >
      <Spinner size="lg" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
