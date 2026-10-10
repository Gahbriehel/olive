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

const DEFAULT_PRIMARY_COLOR = "#6366f1";

export const BrandingSection: React.FC<SettingsSectionProps> = ({
  value: formData,
  onChange: setFormData,
}) => (
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
            value={formData.branding?.primaryColor || DEFAULT_PRIMARY_COLOR}
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
            {formData.branding?.primaryColor || DEFAULT_PRIMARY_COLOR}
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
              primaryColor:
                formData.branding?.primaryColor || DEFAULT_PRIMARY_COLOR,
              ...formData.branding,
              logoText: e.target.value,
            },
          })
        }
      />
    </CardContent>
  </Card>
);
