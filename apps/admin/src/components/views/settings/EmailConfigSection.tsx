import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Input } from "@/components/FormElements/Input";
import { SettingsSectionProps } from "./types";

export const EmailConfigSection: React.FC<SettingsSectionProps> = ({
  value: formData,
  onChange: setFormData,
}) => (
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
);
