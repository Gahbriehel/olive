import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData } from "@/models/base";

export interface IBatchEmailPayload {
  personIds: string[];
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface ISendBatchRegistrantsEmailPayload {
  registrationIds?: string[];
  eventId?: string;
  status?: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED";
  teamId?: string;
  search?: string;
  subject: string;
  heading?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass?: boolean;
}

export interface ISendRegistrantEmailPayload {
  registrationId: string;
  subject: string;
  heading?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass?: boolean;
}

export const emailService = {
  async sendBatchEmail(payload: IBatchEmailPayload): Promise<unknown> {
    const res = await apiClient.post<IBaseResponse<unknown>>(
      "/email/people/batch",
      payload,
    );
    return extractData(res.data);
  },

  async sendBatchRegistrantsEmail(
    payload: ISendBatchRegistrantsEmailPayload,
  ): Promise<unknown> {
    const res = await apiClient.post<IBaseResponse<unknown>>(
      "/email/registrants/batch",
      payload,
    );
    return extractData(res.data);
  },

  async sendRegistrantEmail(
    payload: ISendRegistrantEmailPayload,
  ): Promise<unknown> {
    const res = await apiClient.post<IBaseResponse<unknown>>(
      "/email/registrants/single",
      payload,
    );
    return extractData(res.data);
  },
};
