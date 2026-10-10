import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Check, CheckCircle2, Save, User, Building2, Key } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/QueryState";
import { Input } from "@/components/FormElements/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { IChurchSettings, IUpdateProfilePayload } from "@/models/dashboard";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { customToast } from "@/helpers/customToast";
import { useRouter } from "next/navigation";

interface SettingsViewProps {
  settings?: IChurchSettings;
  onSaveSettings?: (updated: IChurchSettings) => Promise<unknown> | void;
  defaultTab?: string;
  onRefetch?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: propSettings,
  onSaveSettings: propOnSaveSettings,
  defaultTab = "church-info",
  onRefetch,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRoles = getUserRoles(user);
  const isAdmin = hasAuthority(userRoles, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);
  const {
    settings: hookSettings,
    updateSettings: hookUpdateSettings,
    profile,
    updateProfile,
    changePassword,
    isUpdatingSettings,
    isUpdatingProfile,
    isChangingPassword,
    isErrorSettings,
    settingsError,
    refetchSettings,
  } = useSettings();

  const settings = propSettings ||
    hookSettings || {
      churchName: "",
      branchName: "",
      campusName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      websiteUrl: "",
      branding: { primaryColor: "#6366f1", logoText: "" },
      emailConfig: {
        fromName: "",
        fromEmail: "",
        sendConfirmationEmails: true,
        sendReminder24h: true,
      },
      preferences: {
        autoAssignTeams: true,
        requireQrCheckin: true,
        allowSelfRegistration: true,
      },
    };

  const [formData, setFormData] = useState<IChurchSettings>(settings);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabs = useMemo(
    () => [
      ...(isAdmin ? [{ id: "church-info", label: "Church Information" }] : []),
      { id: "profile", label: "My Profile & Security" },
      ...(isAdmin
        ? [
            { id: "branding", label: "Branding & Theme" },
            { id: "email", label: "Email Configuration" },
            { id: "preferences", label: "General Preferences" },
          ]
        : []),
    ],
    [isAdmin],
  );

  useEffect(() => {
    if (defaultTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    const allowedTabIds = tabs.map((t) => t.id);
    if (!allowedTabIds.includes(activeTab) && allowedTabIds.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(allowedTabIds[0]);
    }
  }, [activeTab, tabs]);

  // Profile Form state
  const [profileData, setProfileData] = useState<IUpdateProfilePayload>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });

  // Change Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSavedSuccess, setPasswordSavedSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const performFullLogout = useCallback(() => {
    try {
      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.push("/login");
  }, [logout, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (passwordSavedSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            performFullLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [passwordSavedSuccess, performFullLogout]);

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

  const handleSaveChurchSettings = async () => {
    try {
      if (propOnSaveSettings) {
        await propOnSaveSettings(formData);
      } else {
        await hookUpdateSettings(formData);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Failed to update church settings:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: IUpdateProfilePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      };

      await updateProfile(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        customToast.error(
          "Both current password and new password are required.",
        );
        return;
      }

      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setCountdown(10);
      setPasswordSavedSuccess(true);
    } catch (err: unknown) {
      console.error("Failed to change password:", err);
    }
  };

  // Church settings failed to load: never show (and let admins save) the
  // blank fallback form in place of the real configuration.
  const settingsUnavailable =
    isAdmin && isErrorSettings && !propSettings && !hookSettings;
  const settingsErrorState = (
    <Card>
      <ErrorState
        resource="church settings"
        error={settingsError}
        onRetry={() => (onRefetch ? onRefetch() : refetchSettings())}
      />
    </Card>
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Platform Settings"
        description="Configure church metadata, user profile credentials, branding, and system defaults."
        actions={
          activeTab === "church-info" && !settingsUnavailable ? (
            <>
              <RefreshButton onRefetch={onRefetch} />
              <Button
                variant="primary"
                onClick={handleSaveChurchSettings}
                loading={isUpdatingSettings}
                disabled={isUpdatingSettings}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Configuration
              </Button>
            </>
          ) : undefined
        }
      />

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-success-soft border border-success-border text-success-text font-bold text-xs flex items-center gap-3">
          <Check className="w-5 h-5 text-success-text" />
          Settings successfully saved and synchronized across platform
          instances.
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {settingsUnavailable && activeTab !== "profile" && settingsErrorState}

      {/* Tab 1: Church Info */}
      {activeTab === "church-info" && !settingsUnavailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-text" />
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
                placeholder="e.g. Grace City HQ"
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
              <User className="w-5 h-5 text-primary-text" />
              User Profile Self-Service
            </CardTitle>
            <CardDescription>
              Update your personal credentials, contact numbers, and security
              password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
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
                  placeholder="+234 123 4567 890"
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isUpdatingProfile}
                  disabled={isUpdatingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Update Profile
                </Button>
              </div>
            </form>

            <form
              onSubmit={handleChangePassword}
              className="pt-6 border-t border-border space-y-4 text-xs"
            >
              <h3 className="font-bold text-sm text-fg flex items-center gap-2">
                <Key className="w-4 h-4 text-primary-text" />
                Change Security Password
              </h3>

              {passwordSavedSuccess && (
                <div className="p-3 rounded-xl bg-success-soft border border-success-border text-success-text font-bold text-xs flex items-center gap-3">
                  <Check className="w-4 h-4 text-success-text" />
                  Password successfully updated.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Password"
                  password
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  showPassword={() => setShowCurrentPassword(true)}
                  hidePassword={() => setShowCurrentPassword(false)}
                  required
                />
                <Input
                  label="New Password"
                  password
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new strong password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  showPassword={() => setShowNewPassword(true)}
                  hidePassword={() => setShowNewPassword(false)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isChangingPassword}
                  disabled={isChangingPassword}
                  leftIcon={<Key className="w-4 h-4" />}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Branding */}
      {activeTab === "branding" && !settingsUnavailable && (
        <Card>
          <CardHeader>
            <CardTitle>Branding & Visual Tokens</CardTitle>
            <CardDescription>
              Customize primary accent themes and logo headers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-fg-secondary block mb-1.5">
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
                  className="w-10 h-10 rounded-xl cursor-pointer border border-border-control"
                />
                <span className="font-mono font-bold text-fg">
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
      {activeTab === "email" && !settingsUnavailable && (
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
      {activeTab === "preferences" && !settingsUnavailable && (
        <Card>
          <CardHeader>
            <CardTitle>General System Preferences</CardTitle>
            <CardDescription>
              Global defaults for registration and team assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-subtle">
              <div>
                <p className="font-bold text-fg">
                  Auto-Assign Teams on Registration
                </p>
                <p className="text-2xs text-fg-muted">
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
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-subtle">
              <div>
                <p className="font-bold text-fg">
                  Enforce QR Code Ticket Requirement
                </p>
                <p className="text-2xs text-fg-muted">
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
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Changed Success Modal */}
      <Modal
        isOpen={passwordSavedSuccess}
        // Escape/backdrop must not trigger logout: the countdown and the
        // explicit button below are the only exits.
        onClose={() => {}}
        maxWidth="sm"
      >
        <div className="space-y-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <CheckCircle2 className="h-10 w-10 text-success-text" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-fg">
              Password changed successfully
            </h3>
            <p className="mt-2 text-fg-secondary">
              For security reasons, you will be logged out in{" "}
              <span className="font-medium text-warning-text">{countdown}</span>{" "}
              seconds.
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Please log in again with your new password.
            </p>
          </div>

          <Button
            onClick={performFullLogout}
            className="w-full animate-pulse hover:animate-none"
          >
            {`Log out now (${countdown}s)`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
