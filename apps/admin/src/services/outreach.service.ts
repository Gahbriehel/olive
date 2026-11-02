import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData, extractMeta } from "@/models/base";
import {
  OutreachMessage,
  OutreachOpenPayload,
  OutreachPreview,
  OutreachPreviewRequest,
  OutreachQueryParams,
  OutreachTodayResponse,
  PersonMessageTimelineItem,
} from "@/models/outreach";

export const outreachService = {
  async preview(payload: OutreachPreviewRequest): Promise<OutreachPreview> {
    const res = await apiClient.post<IBaseResponse<OutreachPreview>>(
      "/outreach/whatsapp/preview",
      payload,
    );
    return extractData<OutreachPreview>(res.data);
  },

  async open(payload: OutreachOpenPayload): Promise<OutreachMessage> {
    const res = await apiClient.post<IBaseResponse<OutreachMessage>>(
      "/outreach/whatsapp",
      payload,
    );
    return extractData<OutreachMessage>(res.data);
  },

  async confirm(id: string, sent: boolean): Promise<OutreachMessage> {
    const res = await apiClient.patch<IBaseResponse<OutreachMessage>>(
      `/outreach/${id}/confirm`,
      { sent },
    );
    return extractData<OutreachMessage>(res.data);
  },

  async list(
    params?: OutreachQueryParams,
  ): Promise<{ items: OutreachMessage[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/outreach", {
      params,
    });
    const items = extractData<OutreachMessage[]>(res.data.data) || [];
    const meta = extractMeta(res.data);
    return {
      items: Array.isArray(items) ? items : [],
      meta,
    };
  },

  async today(limit: number = 20): Promise<OutreachTodayResponse> {
    const res = await apiClient.get<IBaseResponse<OutreachTodayResponse>>(
      "/outreach/today",
      {
        params: { limit },
      },
    );
    return extractData<OutreachTodayResponse>(res.data);
  },

  async personMessages(
    personId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{
    items: PersonMessageTimelineItem[];
    meta?: IBaseResponse["meta"] & { total?: number };
  }> {
    const res = await apiClient.get<IBaseResponse<unknown>>(
      `/people/${personId}/messages`,
      { params },
    );
    const items = extractData<PersonMessageTimelineItem[]>(res.data.data) || [];
    const meta = extractMeta(res.data);
    return {
      items: Array.isArray(items) ? items : [],
      meta,
    };
  },
};
