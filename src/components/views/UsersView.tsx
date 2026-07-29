import React, { useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminUser } from "@/types/dashboard";

interface UsersViewProps {
  users: AdminUser[];
}

export const UsersView: React.FC<UsersViewProps> = ({ users }) => {
  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");

  const permissionsMatrix: {
    feature: string;
    superAdmin: boolean;
    churchAdmin: boolean;
    regDesk: boolean;
    gamesCoord: boolean;
  }[] = [
    {
      feature: "Create & Edit Events",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "Publish / Delete Events",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "Manage Registrations & Export CSV",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: false,
    },
    {
      feature: "Reassign Attendee Teams",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: false,
    },
    {
      feature: "Scan QR Badges & Manual Check-in",
      superAdmin: true,
      churchAdmin: true,
      regDesk: true,
      gamesCoord: true,
    },
    {
      feature: "Submit Game Scores & Update Points",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: true,
    },
    {
      feature: "Manage Admin Users & Roles",
      superAdmin: true,
      churchAdmin: false,
      regDesk: false,
      gamesCoord: false,
    },
    {
      feature: "System Settings & Branding",
      superAdmin: true,
      churchAdmin: true,
      regDesk: false,
      gamesCoord: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Users & Permission Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage administrative access for pastoral staff, church admins, desk
            volunteers, and game referees.
          </p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
          Invite Administrator
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Administrator Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`pb-2.5 px-3 font-bold border-b-2 transition-colors ${
            activeTab === "permissions"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          RBAC Role Permission Matrix
        </button>
      </div>

      {activeTab === "users" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5 pl-5">Administrator</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Last Activity</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      <p className="font-semibold text-sm">
                        No administrators found
                      </p>
                      <p className="text-xs mt-1">
                        User management & custom role builder is configured for
                        Phase 2 expansion.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="indigo">{user.role}</Badge>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            user.status === "Active" ? "emerald" : "slate"
                          }
                          dot
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {user.lastActive}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <Button variant="ghost" size="sm">
                          Edit Role
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Role Access Control Matrix</CardTitle>
            <CardDescription>
              System permission rules governing module access per role
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5 pl-5">Feature Capability</th>
                  <th className="p-3.5 text-center">Super Admin</th>
                  <th className="p-3.5 text-center">Church Admin</th>
                  <th className="p-3.5 text-center">Registration Desk</th>
                  <th className="p-3.5 text-center">Games Coordinator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-slate-300">
                {permissionsMatrix.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="p-3.5 pl-5 font-semibold text-slate-900 dark:text-slate-100">
                      {item.feature}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.superAdmin ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.churchAdmin ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.regDesk ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.gamesCoord ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
