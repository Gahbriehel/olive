import { apiClient } from "@/utils/api-client";
import {
  ChurchSettings,
  IUserProfile,
  IUpdateProfilePayload,
} from "@/models/dashboard";
import { IBaseResponse, extractData } from "@/models/base";

export const settingsService = {
  // Fetch Church Settings
  async getSettings(): Promise<ChurchSettings> {
    try {
      const res = await apiClient.get<IBaseResponse<unknown>>("/settings");
      const data = extractData<Record<string, unknown>>(res.data);

      return {
        id: (data.id as string) || "",
        churchName:
          (data.name as string) ||
          (data.churchName as string) ||
          "Church Events",
        branchName: (data.branchName as string) || "",
        campusName: (data.campusName as string) || "Main Campus",
        address: (data.address as string) || "",
        phone: (data.phone as string) || "",
        email: (data.email as string) || "",
        website: (data.websiteUrl as string) || (data.website as string) || "",
        websiteUrl:
          (data.websiteUrl as string) || (data.website as string) || "",
        branding: {
          primaryColor:
            (data.branding as Record<string, string>)?.primaryColor ||
            "#6366f1",
          logoText:
            (data.branding as Record<string, string>)?.logoText ||
            "GRACE CITY EVENTS",
        },
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
    } catch {
      // Fallback if settings endpoint error
      return {
        churchName: "Church Events",
        branchName: "",
        campusName: "Main Campus",
        address: "",
        phone: "",
        email: "",
        website: "",
        branding: {
          primaryColor: "#6366f1",
          logoText: "GRACE CITY EVENTS",
        },
      };
    }
  },

  // Update Church Settings
  async updateSettings(
    settings: Partial<ChurchSettings>,
  ): Promise<ChurchSettings> {
    const payload = {
      name: settings.churchName,
      churchName: settings.churchName,
      branchName: settings.branchName,
      campusName: settings.campusName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      websiteUrl: settings.websiteUrl || settings.website,
    };

    const res = await apiClient.patch<IBaseResponse<unknown>>(
      "/settings",
      payload,
    );
    const data = extractData<Record<string, unknown>>(res.data);

    return {
      ...settings,
      id: (data.id as string) || settings.id,
      churchName:
        (data.name as string) ||
        (data.churchName as string) ||
        settings.churchName ||
        "Church Events",
      branchName: (data.branchName as string) || settings.branchName || "",
      campusName: (data.campusName as string) || settings.campusName || "",
      address: (data.address as string) || settings.address || "",
      phone: (data.phone as string) || settings.phone || "",
      email: (data.email as string) || settings.email || "",
      website:
        (data.websiteUrl as string) ||
        (data.website as string) ||
        settings.website ||
        "",
      websiteUrl:
        (data.websiteUrl as string) ||
        (data.website as string) ||
        settings.websiteUrl ||
        "",
    } as ChurchSettings;
  },

  // Get current user self profile
  async getProfile(): Promise<IUserProfile> {
    const res =
      await apiClient.get<IBaseResponse<IUserProfile>>("/settings/me");
    return extractData<IUserProfile>(res.data);
  },

  // Update current user self profile
  async updateProfile(payload: IUpdateProfilePayload): Promise<IUserProfile> {
    const res = await apiClient.patch<IBaseResponse<IUserProfile>>(
      "/settings/me",
      payload,
    );
    return extractData<IUserProfile>(res.data);
  },
};
