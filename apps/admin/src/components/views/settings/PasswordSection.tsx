import React, { useState } from "react";
import { Check, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import { IChangePasswordPayload } from "@/models/auth";
import { customToast } from "@/helpers/customToast";

interface PasswordSectionProps {
  onChangePassword: (payload: IChangePasswordPayload) => Promise<unknown>;
  isChanging: boolean;
  /** True once the password has been changed (shows the inline banner). */
  passwordChanged: boolean;
  onPasswordChanged: () => void;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({
  onChangePassword,
  isChanging,
  passwordChanged,
  onPasswordChanged,
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        customToast.error(
          "Both current password and new password are required.",
        );
        return;
      }

      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ currentPassword: "", newPassword: "" });
      onPasswordChanged();
    } catch (err: unknown) {
      console.error("Failed to change password:", err);
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="pt-6 border-t border-border space-y-4 text-xs"
    >
      <h3 className="font-bold text-sm text-fg flex items-center gap-2">
        <Key className="w-4 h-4 text-primary-text" />
        Change Security Password
      </h3>

      {passwordChanged && (
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
            setPasswordData({ ...passwordData, newPassword: e.target.value })
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
          loading={isChanging}
          disabled={isChanging}
          leftIcon={<Key className="w-4 h-4" />}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
};
