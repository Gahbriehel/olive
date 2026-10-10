import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { SettingsSectionProps } from "./types";

export const PreferencesSection: React.FC<SettingsSectionProps> = ({
  value: formData,
  onChange: setFormData,
}) => (
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
          <p className="font-bold text-fg">Auto-Assign Teams on Registration</p>
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
