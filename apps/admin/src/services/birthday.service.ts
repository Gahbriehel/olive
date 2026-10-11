import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData, extractMeta } from "@/models/base";
import {
  SendBirthdayGreetingPayload,
  SendBirthdayGreetingResponse,
  BirthdayListResponse,
  BirthdayPersonItem,
  BirthdayAnalyticsResponse,
  BirthdayStatusFilter,
} from "@/models/birthday";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNumber(value: unknown, key: string): number | undefined {
  if (!isRecord(value)) return undefined;
  const number = value[key];
  return typeof number === "number" ? number : undefined;
}

export interface BirthdayQueryParams {
  year?: number;
  month?: number;
  status?: BirthdayStatusFilter | string;
  search?: string;
  page?: number;
  limit?: number;
}

export const birthdayService = {
  async sendBirthdayGreeting(
    payload: SendBirthdayGreetingPayload,
  ): Promise<SendBirthdayGreetingResponse> {
    const res = await apiClient.post<
      IBaseResponse<SendBirthdayGreetingResponse> | SendBirthdayGreetingResponse
    >("/birthdays/send", payload);
    return extractData<SendBirthdayGreetingResponse>(res.data);
  },

  async getBirthdays(
    params?: BirthdayQueryParams,
  ): Promise<BirthdayListResponse> {
    const res = await apiClient.get<unknown>("/birthdays", { params });
    const payload = extractData<unknown>(res.data);
    const payloadRecord = isRecord(payload) ? payload : undefined;
    const birthdays = Array.isArray(payload)
      ? payload
      : (payloadRecord?.birthdays ??
        payloadRecord?.data ??
        payloadRecord?.items);

    if (!Array.isArray(birthdays)) {
      throw new Error(
        "Unexpected response from GET /birthdays: expected a birthday list.",
      );
    }

    const meta = extractMeta(res.data);
    const pagination = payloadRecord?.pagination;
    const total =
      getNumber(pagination, "total") ??
      getNumber(payloadRecord, "total") ??
      meta?.total ??
      birthdays.length;
    const page =
      getNumber(pagination, "page") ??
      getNumber(payloadRecord, "page") ??
      meta?.page ??
      params?.page ??
      1;
    const limit =
      getNumber(pagination, "limit") ??
      getNumber(payloadRecord, "limit") ??
      meta?.limit ??
      params?.limit ??
      10;
    const totalPages =
      getNumber(pagination, "totalPages") ??
      getNumber(payloadRecord, "totalPages") ??
      meta?.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(limit, 1)));

    return {
      data: birthdays as BirthdayPersonItem[],
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getBirthdayAnalytics(params?: {
    year?: number;
    month?: number;
  }): Promise<BirthdayAnalyticsResponse> {
    const res = await apiClient.get<
      IBaseResponse<BirthdayAnalyticsResponse> | BirthdayAnalyticsResponse
    >("/birthdays/analytics", { params });
    return extractData<BirthdayAnalyticsResponse>(res.data);
  },
};
