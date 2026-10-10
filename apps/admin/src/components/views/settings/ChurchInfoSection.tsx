import React from "react";
import { Building2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Input } from "@/components/FormElements/Input";
import { SettingsSectionProps } from "./types";

export const ChurchInfoSection: React.FC<SettingsSectionProps> = ({
  value: formData,
  onChange: setFormData,
}) => (
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
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Official Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
);
