import React from "react";
import { clsx } from "clsx";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-1 overflow-x-auto p-1 bg-muted rounded-xl max-w-full no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[38px] cursor-pointer",
              isActive
                ? "bg-surface text-primary-text shadow-sm"
                : "text-fg-secondary hover:text-fg",
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "px-1.5 py-0.5 text-2xs rounded-md font-mono",
                  isActive
                    ? "bg-primary-soft text-primary-text"
                    : "bg-muted-strong text-fg-secondary",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
