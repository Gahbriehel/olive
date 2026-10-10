import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/helpers/cn";

export interface Crumb {
  label: string;
  /** Omit for the current page (always the last crumb). */
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-fg-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded font-medium transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "max-w-[16rem] truncate",
                    isLast && "font-semibold text-fg-secondary",
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-fg-subtle"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
