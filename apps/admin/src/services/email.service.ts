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

export const emailService = {
  async sendBatchEmail(payload: IBatchEmailPayload): Promise<unknown> {
    const res = await apiClient.post<IBaseResponse<unknown>>(
      "/email/people/batch",
      payload,
    );
    return extractData(res.data);
  },
};
