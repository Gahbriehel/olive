import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData } from "@/models/base";
import {
  CreateMessageTemplatePayload,
  MessageChannel,
  MessageTemplate,
  OutreachPurpose,
  TemplatePreviewResponse,
  UpdateMessageTemplatePayload,
} from "@/models/outreach";
import { CheckInReason } from "@olive/types";

export interface MessageTemplateFilterParams {
  channel?: MessageChannel;
  purpose?: OutreachPurpose;
  checkInReason?: CheckInReason;
  includeInactive?: boolean;
}

export interface DeleteTemplateResponse {
  message?: string;
  action?: "deleted" | "deactivated";
}

export const messageTemplateService = {
  async list(params?: MessageTemplateFilterParams): Promise<MessageTemplate[]> {
    const res = await apiClient.get<IBaseResponse<MessageTemplate[]>>(
      "/message-templates",
      { params },
    );
    const data = extractData<MessageTemplate[]>(res.data);
    return Array.isArray(data) ? data : [];
  },

  async create(
    payload: CreateMessageTemplatePayload,
  ): Promise<MessageTemplate> {
    const res = await apiClient.post<IBaseResponse<MessageTemplate>>(
      "/message-templates",
      payload,
    );
    return extractData<MessageTemplate>(res.data);
  },

  async update(
    id: string,
    payload: UpdateMessageTemplatePayload,
  ): Promise<MessageTemplate> {
    const res = await apiClient.patch<IBaseResponse<MessageTemplate>>(
      `/message-templates/${id}`,
      payload,
    );
    return extractData<MessageTemplate>(res.data);
  },

  async remove(id: string): Promise<DeleteTemplateResponse> {
    const res = await apiClient.delete<IBaseResponse<DeleteTemplateResponse>>(
      `/message-templates/${id}`,
    );
    return extractData<DeleteTemplateResponse>(res.data);
  },

  async previewBody(body: string): Promise<TemplatePreviewResponse> {
    const res = await apiClient.post<IBaseResponse<TemplatePreviewResponse>>(
      "/message-templates/preview",
      { body },
    );
    return extractData<TemplatePreviewResponse>(res.data);
  },
};
