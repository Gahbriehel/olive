import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/helpers/cn";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Trail above the title, for nested pages (detail views, reports). */
  breadcrumbs?: Crumb[];
  /** Page-level actions (create, refresh, export, view toggles). */
  actions?: ReactNode;
  className?: string;
}

/** The single page title block. Renders the page's only <h1>. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="shrink-0 rounded-xl border border-primary-border bg-primary-soft p-2 text-primary-text">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-fg sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm text-fg-muted">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
