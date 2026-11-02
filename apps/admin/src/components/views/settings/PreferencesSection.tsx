import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import {
  getStoredWhatsAppTargetPref,
  setStoredWhatsAppTargetPref,
  type WhatsAppTarget,
} from "@/utils/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { SettingsSectionProps } from "./types";

export const PreferencesSection: React.FC<SettingsSectionProps> = ({
  value: formData,
  onChange: setFormData,
}) => {
  const [waPref, setWaPref] = useState<"auto" | WhatsAppTarget>(() =>
    getStoredWhatsAppTargetPref(),
  );

  const handleWaPrefChange = (val: "auto" | WhatsAppTarget) => {
    setWaPref(val);
    setStoredWhatsAppTargetPref(val);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General System Preferences</CardTitle>
        <CardDescription>
          Global defaults for registration, team assignment, and WhatsApp
          outreach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {/* WhatsApp Target Preference */}
        <div className="p-3.5 rounded-xl bg-subtle border border-border space-y-2">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="w-4 h-4 text-success-text" />
            <div>
              <p className="font-bold text-fg">Open WhatsApp in</p>
              <p className="text-2xs text-fg-muted">
                Choose how WhatsApp links open from this specific
                browser/device.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <select
              value={waPref}
              onChange={(e) =>
                handleWaPrefChange(e.target.value as "auto" | WhatsAppTarget)
              }
              className="w-full sm:w-72 text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="auto">Automatic (recommended)</option>
              <option value="web">WhatsApp Web</option>
              <option value="android-business">WhatsApp Business app</option>
              <option value="universal">Phone WhatsApp</option>
            </select>
          </div>
        </div>

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
  );
};
