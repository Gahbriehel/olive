import { isAxiosError } from "axios";
import { apiClient } from "@/utils/api-client";
import { extractArray } from "@/models/base";
import {
  CreateNightPrayerExceptionPayload,
  NightPrayerConfig,
  NightPrayerException,
  NightPrayerPayload,
} from "@/models/night-prayer";

export const nightPrayerService = {
  /** Null until an admin saves the config for the first time. */
  async get(): Promise<NightPrayerConfig | null> {
    try {
      const res = await apiClient.get("/night-prayer");
      return (res.data?.data ?? null) as NightPrayerConfig | null;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  async save(payload: NightPrayerPayload): Promise<NightPrayerConfig> {
    const res = await apiClient.put("/night-prayer", payload);
    return (res.data?.data ?? payload) as NightPrayerConfig;
  },

  async getExceptions(): Promise<NightPrayerException[]> {
    const res = await apiClient.get("/night-prayer/exceptions");
    return extractArray<NightPrayerException>(res.data);
  },

  async createException(
    payload: CreateNightPrayerExceptionPayload,
  ): Promise<NightPrayerException> {
    const res = await apiClient.post("/night-prayer/exceptions", payload);
    return res.data?.data as NightPrayerException;
  },

  async removeException(id: string): Promise<void> {
    await apiClient.delete(`/night-prayer/exceptions/${id}`);
  },
};
