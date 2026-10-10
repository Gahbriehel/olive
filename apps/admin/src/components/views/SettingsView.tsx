import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/QueryState";
import { Tabs } from "@/components/ui/Tabs";
import { IChurchSettings, IUpdateProfilePayload } from "@/models/dashboard";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { getUserRoles, hasAuthority, ROLES } from "@/utils/rbac";
import { useRouter } from "next/navigation";
import { ChurchInfoSection } from "./settings/ChurchInfoSection";
import { ProfileSection } from "./settings/ProfileSection";
import { PasswordSection } from "./settings/PasswordSection";
import { PasswordChangedDialog } from "./settings/PasswordChangedDialog";
import { BrandingSection } from "./settings/BrandingSection";
import { EmailConfigSection } from "./settings/EmailConfigSection";
import { PreferencesSection } from "./settings/PreferencesSection";

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

  const [profileData, setProfileData] = useState<IUpdateProfilePayload>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
  });
  const [passwordChanged, setPasswordChanged] = useState(false);

  const performFullLogout = useCallback(() => {
    try {
      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.push("/login");
  }, [logout, router]);

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
    } catch (err: unknown) {
      console.error("Failed to update church settings:", err);
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

      {/* Settings Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {settingsUnavailable && activeTab !== "profile" && settingsErrorState}

      {activeTab === "church-info" && !settingsUnavailable && (
        <ChurchInfoSection value={formData} onChange={setFormData} />
      )}

      {activeTab === "profile" && (
        <ProfileSection
          value={profileData}
          onChange={setProfileData}
          onSave={updateProfile}
          isSaving={isUpdatingProfile}
        >
          <PasswordSection
            onChangePassword={changePassword}
            isChanging={isChangingPassword}
            passwordChanged={passwordChanged}
            onPasswordChanged={() => setPasswordChanged(true)}
          />
        </ProfileSection>
      )}

      {activeTab === "branding" && !settingsUnavailable && (
        <BrandingSection value={formData} onChange={setFormData} />
      )}

      {activeTab === "email" && !settingsUnavailable && (
        <EmailConfigSection value={formData} onChange={setFormData} />
      )}

      {activeTab === "preferences" && !settingsUnavailable && (
        <PreferencesSection value={formData} onChange={setFormData} />
      )}

      <PasswordChangedDialog
        isOpen={passwordChanged}
        onLogout={performFullLogout}
      />
    </div>
  );
};
