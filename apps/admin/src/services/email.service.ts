import { apiClient } from "@/utils/api-client";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractMeta,
} from "@/models/base";
import { EmailLogItem } from "@/models/emailLog";
import { type ApiRegistrationStatus } from "@/models/registration";

export interface IBatchEmailPayload {
  personIds: string[];
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export interface ISendSinglePersonEmailPayload {
  personId: string;
  subject: string;
  heading: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export interface ISendBatchRegistrantsEmailPayload {
  registrationIds?: string[];
  eventId?: string;
  status?: ApiRegistrationStatus;
  teamId?: string;
  search?: string;
  subject: string;
  heading?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass?: boolean;
  imageUrl?: string;
}

export interface ISendRegistrantEmailPayload {
  registrationId: string;
  subject: string;
  heading?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  includeQrPass?: boolean;
  imageUrl?: string;
}

export const emailService = {
  async getEmailLogs(
    params?: IQueryParams,
  ): Promise<{ items: EmailLogItem[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/email/logs", {
      params,
    });
    const items = extractData<EmailLogItem[]>(res.data.data) || [];
    const meta = extractMeta(res.data);
    return {
      items: Array.isArray(items) ? items : [],
      meta,
    };
  },

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

  async sendSinglePersonEmail(
    payload: ISendSinglePersonEmailPayload,
  ): Promise<unknown> {
    return emailService.sendBatchEmail({
      personIds: [payload.personId],
      subject: payload.subject,
      heading: payload.heading,
      message: payload.message,
      ctaLabel: payload.ctaLabel,
      ctaUrl: payload.ctaUrl,
      imageUrl: payload.imageUrl,
    });
  },
};
