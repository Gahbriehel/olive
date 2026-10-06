import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData, extractMeta } from "@/models/base";
import {
  EmailBounce,
  EmailBounceQueryParams,
  EmailBounceListResponse,
  EmailBounceAnalyticsResponse,
  RemediateBouncePayload,
  RemediateBounceResponse,
} from "@/models/emailBounce";

export const emailBounceService = {
  /**
   * Retrieves paginated list of email bounce alerts with filtering
   */
  async getBounces(
    params?: EmailBounceQueryParams,
  ): Promise<EmailBounceListResponse> {
    const res = await apiClient.get<
      IBaseResponse<EmailBounce[]> | EmailBounceListResponse | EmailBounce[]
    >("/email-bounces", { params });

    const raw = res.data as unknown as Record<string, unknown>;
    const items = extractData<EmailBounce[]>(raw);
    const meta = extractMeta(raw);

    const safeItems = Array.isArray(items)
      ? items
      : Array.isArray(res.data)
        ? (res.data as EmailBounce[])
        : [];

    return {
      data: safeItems,
      total: meta?.total ?? safeItems.length,
      page: meta?.page ?? (params?.page || 1),
      limit: meta?.limit ?? (params?.limit || 10),
      totalPages: meta?.totalPages ?? 1,
    };
  },

  /**
   * Retrieves overall email bounce analytics and breakdown trends
   */
  async getBounceAnalytics(params?: {
    year?: number;
    month?: number;
    emailType?: string;
    recipientType?: string;
  }): Promise<EmailBounceAnalyticsResponse> {
    const res = await apiClient.get<
      IBaseResponse<EmailBounceAnalyticsResponse> | EmailBounceAnalyticsResponse
    >("/email-bounces/analytics", { params });
    return extractData<EmailBounceAnalyticsResponse>(res.data);
  },

  /**
   * Updates the recipient's email on Person/User record, resets deliverability,
   * marks bounce as resolved, and optionally resends original email
   */
  async remediateBounce(
    id: string,
    payload: RemediateBouncePayload,
  ): Promise<RemediateBounceResponse> {
    const res = await apiClient.post<
      IBaseResponse<RemediateBounceResponse> | RemediateBounceResponse
    >(`/email-bounces/${id}/remediate`, payload);
    return extractData<RemediateBounceResponse>(res.data);
  },

  /**
   * Marks the bounce alert as resolved without updating member email records
   */
  async resolveBounce(id: string): Promise<EmailBounce> {
    const res = await apiClient.patch<IBaseResponse<EmailBounce> | EmailBounce>(
      `/email-bounces/${id}/resolve`,
    );
    return extractData<EmailBounce>(res.data);
  },

  /**
   * Deletes a bounce alert record
   */
  async deleteBounce(id: string): Promise<unknown> {
    const res = await apiClient.delete<IBaseResponse<unknown>>(
      `/email-bounces/${id}`,
    );
    return extractData(res.data);
  },
};
