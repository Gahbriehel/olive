import { apiClient } from "@/utils/api-client";
import { extractArray, extractData, extractMeta } from "@/models/base";
import {
  Encouragement,
  EncouragementPayload,
  NotificationSettings,
  PushOverview,
} from "@/models/notifications";

export const notificationsService = {
  /** Not run through extractData: it would unwrap `logs` and drop `subscribers`. */
  async getPushOverview(): Promise<PushOverview> {
    const res = await apiClient.get("/push/log");
    const data = res.data?.data ?? {};
    return {
      subscribers: {
        total: data.subscribers?.total ?? 0,
        byTopic: data.subscribers?.byTopic ?? {},
      },
      logs: Array.isArray(data.logs) ? data.logs : [],
    };
  },

  async getEncouragements(
    page: number,
    limit: number,
  ): Promise<{ items: Encouragement[]; totalPages: number; total: number }> {
    const res = await apiClient.get("/encouragements", {
      params: { page, limit },
    });
    const items = extractArray<Encouragement>(res.data);
    const meta = extractMeta(res.data);
    return {
      items,
      total: meta?.total ?? items.length,
      totalPages: meta?.totalPages ?? 1,
    };
  },

  async createEncouragement(payload: EncouragementPayload) {
    const res = await apiClient.post("/encouragements", payload);
    return extractData<Encouragement>(res.data);
  },

  async updateEncouragement(
    id: string,
    payload: Partial<EncouragementPayload>,
  ) {
    const res = await apiClient.put(`/encouragements/${id}`, payload);
    return extractData<Encouragement>(res.data);
  },

  async removeEncouragement(id: string) {
    await apiClient.delete(`/encouragements/${id}`);
  },

  async getSettings(): Promise<NotificationSettings> {
    const res = await apiClient.get("/notification-settings");
    const data = res.data?.data ?? {};
    return {
      scriptureSendTime: data.scriptureSendTime ?? "07:00",
      encouragementSlots: Array.isArray(data.encouragementSlots)
        ? data.encouragementSlots
        : [],
    };
  },

  async saveSettings(payload: NotificationSettings) {
    const res = await apiClient.put("/notification-settings", payload);
    return (res.data?.data ?? payload) as NotificationSettings;
  },
};
