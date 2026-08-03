import React, { useState, useEffect } from "react";
import { Check, Save, User, Building2, Key, AlertCircle } from "lucide-react";
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
import { ChurchSettings, IUpdateProfilePayload } from "@/models/dashboard";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";

interface SettingsViewProps {
  settings?: ChurchSettings;
  onSaveSettings?: (updated: ChurchSettings) => Promise<unknown> | void;
  defaultTab?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: propSettings,
  onSaveSettings: propOnSaveSettings,
  defaultTab = "church-info",
}) => {
  const { user } = useAuth();
  const {
    settings: hookSettings,
    updateSettings: hookUpdateSettings,
    profile,
    updateProfile,
    isUpdatingSettings,
    isUpdatingProfile,
  } = useSettings();

  const settings = propSettings ||
    hookSettings || {
      churchName: "Church Events",
      branchName: "",
      campusName: "Main Campus",
      address: "",
      phone: "",
      email: "",
      website: "",
      websiteUrl: "",
      branding: { primaryColor: "#6366f1", logoText: "GRACE CITY EVENTS" },
      emailConfig: {
        fromName: "Grace City Youth Events",
        fromEmail: "events@gracecity.org",
        sendConfirmationEmails: true,
        sendReminder24h: true,
      },
      preferences: {
        autoAssignTeams: true,
        requireQrCheckin: true,
        allowSelfRegistration: true,
      },
    };

  const [formData, setFormData] = useState<ChurchSettings>(settings);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form state
  const [profileData, setProfileData] = useState<IUpdateProfilePayload>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (hookSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(hookSettings);
    }
  }, [hookSettings]);

  useEffect(() => {
    if (profile || user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileData((prev) => ({
        ...prev,
        firstName: profile?.firstName || user?.firstName || "",
        lastName: profile?.lastName || user?.lastName || "",
        email: profile?.email || user?.email || "",
        phone: profile?.phone || "",
      }));
    }
  }, [profile, user]);

  const tabs = [
    { id: "church-info", label: "Church Information" },
    { id: "profile", label: "My Profile & Security" },
    { id: "branding", label: "Branding & Theme" },
    { id: "email", label: "Email Configuration" },
    { id: "preferences", label: "General Preferences" },
  ];

  const handleSaveChurchSettings = async () => {
    try {
      setErrorMessage(null);
      if (propOnSaveSettings) {
        await propOnSaveSettings(formData);
      } else {
        await hookUpdateSettings(formData);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update church settings.";
      setErrorMessage(msg);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      const payload: IUpdateProfilePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.newPassword) {
        if (!profileData.currentPassword) {
          setErrorMessage(
            "Current password is required to update your password.",
          );
          return;
        }
        payload.currentPassword = profileData.currentPassword;
        payload.newPassword = profileData.newPassword;
      }

      await updateProfile(payload);
      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update profile. Please verify your current password.";
      setErrorMessage(msg);
    }
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
            Configure church metadata, user profile credentials, multi-campus
            branding, and system defaults.
          </p>
        </div>
        {activeTab === "church-info" && (
          <Button
            variant="primary"
            onClick={handleSaveChurchSettings}
            disabled={isUpdatingSettings}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {isUpdatingSettings ? "Saving..." : "Save Configuration"}
          </Button>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          Settings successfully saved and synchronized across platform
          instances.
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          {errorMessage}
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Church Info */}
      {activeTab === "church-info" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Church & Organization Information
            </CardTitle>
            <CardDescription>
              Primary organization details displayed on attendee invitations,
              invoices, and tickets
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
                label="Branch / Division Name"
                value={formData.branchName || ""}
                placeholder="e.g. Grace City HQ / North Division"
                onChange={(e) =>
                  setFormData({ ...formData, branchName: e.target.value })
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
                value={formData.websiteUrl || formData.website}
                placeholder="https://gracecity.org"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    website: e.target.value,
                    websiteUrl: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: User Profile Self-Service */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              User Profile Self-Service
            </CardTitle>
            <CardDescription>
              Update your personal credentials, contact numbers, and security
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  required
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone || ""}
                  placeholder="+1 (555) 000-1234"
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  Change Security Password
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password to authorize changes"
                    value={profileData.currentPassword}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new strong password"
                    value={profileData.newPassword}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  {isUpdatingProfile ? "Updating Profile..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Branding */}
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
                  value={formData.branding?.primaryColor || "#6366f1"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: {
                        logoText: formData.branding?.logoText || "",
                        ...formData.branding,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formData.branding?.primaryColor || "#6366f1"}
                </span>
              </div>
            </div>

            <Input
              label="Logo Text Brand Header"
              value={formData.branding?.logoText || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branding: {
                    primaryColor: formData.branding?.primaryColor || "#6366f1",
                    ...formData.branding,
                    logoText: e.target.value,
                  },
                })
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Email Config */}
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
                value={formData.emailConfig?.fromName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: {
                      fromEmail: formData.emailConfig?.fromEmail || "",
                      sendConfirmationEmails: true,
                      sendReminder24h: true,
                      ...formData.emailConfig,
                      fromName: e.target.value,
                    },
                  })
                }
              />
              <Input
                label="Sender Email Address"
                value={formData.emailConfig?.fromEmail || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailConfig: {
                      fromName: formData.emailConfig?.fromName || "",
                      sendConfirmationEmails: true,
                      sendReminder24h: true,
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

      {/* Tab 5: Preferences */}
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
                  Balance attendee allocation across the event teams upon signup
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.preferences?.autoAssignTeams ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      requireQrCheckin: true,
                      allowSelfRegistration: true,
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
                checked={formData.preferences?.requireQrCheckin ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      autoAssignTeams: true,
                      allowSelfRegistration: true,
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
