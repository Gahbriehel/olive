import React from "react";
import { Save, User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { IUpdateProfilePayload } from "@/models/dashboard";

interface ProfileSectionProps {
  /** Form state is owned by SettingsView so edits survive tab switches. */
  value: IUpdateProfilePayload;
  onChange: (next: IUpdateProfilePayload) => void;
  onSave: (payload: IUpdateProfilePayload) => Promise<unknown>;
  isSaving: boolean;
  /** Called after a successful save (shows the page-level success banner). */
  onSaved?: () => void;
  /** Rendered below the profile form, inside the same card. */
  children?: React.ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  value: profileData,
  onChange: setProfileData,
  onSave,
  isSaving,
  onSaved,
  children,
}) => {
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      });
      onSaved?.();
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
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
                setProfileData({ ...profileData, firstName: e.target.value })
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
              loading={isSaving}
              disabled={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Profile
            </Button>
          </div>
        </form>

        {children}
      </CardContent>
    </Card>
  );
};
