import { ReactNode } from "react";

export type UsersTab = "users" | "permissions";

interface UsersTabsProps {
  activeTab: UsersTab;
  onChange: (tab: UsersTab) => void;
  userCount: number;
  /** The active tab's panel. */
  children: ReactNode;
}

const tabClass = (active: boolean) =>
  `pb-2.5 px-3 font-bold border-b-2 transition-colors ${
    active
      ? "border-primary text-primary-text"
      : "border-transparent text-fg-muted hover:text-fg"
  }`;

export function UsersTabs({
  activeTab,
  onChange,
  userCount,
  children,
}: UsersTabsProps) {
  return (
    <>
      <div
        role="tablist"
        aria-label="User management views"
        className="flex items-center gap-2 border-b border-border text-xs"
      >
        <button
          type="button"
          role="tab"
          id="users-tab-users"
          aria-selected={activeTab === "users"}
          aria-controls="users-tabpanel"
          onClick={() => onChange("users")}
          className={tabClass(activeTab === "users")}
        >
          Administrator & User Directory ({userCount})
        </button>
        <button
          type="button"
          role="tab"
          id="users-tab-permissions"
          aria-selected={activeTab === "permissions"}
          aria-controls="users-tabpanel"
          onClick={() => onChange("permissions")}
          className={tabClass(activeTab === "permissions")}
        >
          RBAC Role Permission Matrix
        </button>
      </div>

      <div
        role="tabpanel"
        id="users-tabpanel"
        aria-labelledby={
          activeTab === "users" ? "users-tab-users" : "users-tab-permissions"
        }
      >
        {children}
      </div>
    </>
  );
}
