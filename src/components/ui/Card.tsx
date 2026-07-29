import React from "react";
import { clsx } from "clsx";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={clsx(
      "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-200",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx("p-5 pb-3 flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={clsx(
      "text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, children, ...props }) => (
  <p
    className={clsx(
      "text-xs text-slate-500 dark:text-slate-400 font-normal",
      className,
    )}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={clsx("p-5 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={clsx(
      "p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 mt-3 pt-3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
