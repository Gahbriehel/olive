import React, { useState } from "react";
import { Check, Save } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { ChurchSettings } from "@/types/dashboard";

interface SettingsViewProps {
  settings: ChurchSettings;
  onSaveSettings: (updated: ChurchSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<ChurchSettings>(settings);
  const [activeTab, setActiveTab] = useState("church-info");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabs = [
    { id: "church-info", label: "Church Information" },
    { id: "branding", label: "Branding & Theme" },
    { id: "email", label: "Email Configuration" },
    { id: "preferences", label: "General Preferences" },
  ];

  const handleSave = () => {
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure church metadata, multi-campus branding, email confirmation
            dispatches, and event defaults.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          leftIcon={<Save className="w-4 h-4" />}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          Save Configuration
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          Settings successfully saved and synchronized across platform
          instances.
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Church Info */}
      {activeTab === "church-info" && (
        <Card>
          <CardHeader>
            <CardTitle>Church & Organization Information</CardTitle>
            <CardDescription>
              Primary organization details displayed on attendee invoices and
              tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Church Name"
                value={formData.churchName}
                onChange={(e) =>
                  setFormData({ ...formData, churchName: e.target.value })
                }
              />
              <Input
                label="Campus Name"
                value={formData.campusName}
                onChange={(e) =>
                  setFormData({ ...formData, campusName: e.target.value })
                }
              />
              <Input
                label="Physical Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <Input
                label="Primary Contact Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Input
                label="Official Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                label="Website URL"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Branding */}
      {activeTab === "branding" && (
        <Card>
          <CardHeader>
            <CardTitle>Branding & Visual Tokens</CardTitle>
            <CardDescription>
              Customize primary accent themes and logo headers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Primary Brand Color Accent
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.branding.primaryColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        ...formData.branding,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formData.branding.primaryColor}
                </span>
              </div>
            </div>

            <Input
              label="Logo Text Brand Header"
              value={formData.branding.logoText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branding: { ...formData.branding, logoText: e.target.value },
                })
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Email Config */}
      {activeTab === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Email Confirmation & QR Ticket Dispatch</CardTitle>
            <CardDescription>
              Sender identity and automatic email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sender Display Name"
                value={formData.emailConfig.fromName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: {
                      ...formData.emailConfig,
                      fromName: e.target.value,
                    },
                  })
                }
              />
              <Input
                label="Sender Email Address"
                value={formData.emailConfig.fromEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: {
                      ...formData.emailConfig,
                      fromEmail: e.target.value,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Preferences */}
      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>General System Preferences</CardTitle>
            <CardDescription>
              Global defaults for registration and team assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Auto-Assign Teams on Registration
                </p>
                <p className="text-[11px] text-slate-400">
                  Balance attendee allocation across the 4 event teams upon
                  signup
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.preferences.autoAssignTeams}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      autoAssignTeams: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Enforce QR Code Ticket Requirement
                </p>
                <p className="text-[11px] text-slate-400">
                  Require digital QR code verification at desk terminals
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.preferences.requireQrCheckin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      requireQrCheckin: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
