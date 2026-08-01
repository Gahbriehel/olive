import { ChurchSettings } from "@/types/dashboard";

const MOCK_SETTINGS: ChurchSettings = {
  churchName: "Church Events",
  campusName: "Main Campus",
  address: "742 Evergreen Terrace, Metropolis",
  phone: "+1 (555) 000-1234",
  email: "info@gracecity.org",
  website: "https://gracecity.org",
  branding: {
    primaryColor: "#6366f1",
    logoText: "GRACE CITY EVENTS",
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

export const settingsService = {
  // Mock fetching settings
  async getSettings(): Promise<ChurchSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_SETTINGS });
      }, 500);
    });
  },

  // Mock updating settings
  async updateSettings(settings: ChurchSettings): Promise<ChurchSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would be an API call
        // For the mock, we just return the new settings
        resolve({ ...settings });
      }, 500);
    });
  },
};
