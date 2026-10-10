import React from "react";

interface EventFormSectionProps {
  icon: React.ReactNode;
  title: string;
  /** Rendered on the right of the section header. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/** Card wrapper shared by every EventsForm section. */
export function EventFormSection({
  icon,
  title,
  aside,
  children,
}: EventFormSectionProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fg flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </div>
  );
}
