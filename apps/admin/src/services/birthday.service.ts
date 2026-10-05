import { apiClient } from "@/utils/api-client";
import { IBaseResponse, extractData } from "@/models/base";
import {
  SendBirthdayGreetingPayload,
  SendBirthdayGreetingResponse,
  BirthdayListResponse,
  BirthdayAnalyticsResponse,
  BirthdayStatusFilter,
} from "@/models/birthday";

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
    const res = await apiClient.get<
      IBaseResponse<BirthdayListResponse> | BirthdayListResponse
    >("/birthdays", { params });
    return extractData<BirthdayListResponse>(res.data);
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
