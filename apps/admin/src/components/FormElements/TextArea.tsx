import { clsx } from "clsx";
import {
  forwardRef,
  type DetailedHTMLProps,
  type TextareaHTMLAttributes,
} from "react";
import { ErrorMessage } from "./ErrorMessage";

interface Props extends DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  function TextArea({ id, label, error, required, className, ...props }, ref) {
    return (
      <fieldset className="relative space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}&nbsp; {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex">
          <textarea
            {...props}
            ref={ref}
            id={id}
            className={clsx(
              "min-h-[120px] w-full rounded-xl border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:cursor-not-allowed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150",
              className,
              error &&
                "border-rose-500 focus:ring-rose-500/30 focus:border-rose-500",
            )}
          />
        </div>
        {error && <ErrorMessage message={error} />}
      </fieldset>
    );
  },
);
