import { apiClient } from "@/utils/api-client";
import {
  IPastoralCheckIn,
  ICreateCheckInPayload,
  IUpdateCheckInPayload,
  ICheckInQueryParams,
} from "@/models/checkIn";
import {
  IBaseResponse,
  extractArray,
  extractData,
  extractMeta,
} from "@/models/base";

export const checkInService = {
  async getCheckIns(params?: ICheckInQueryParams): Promise<{
    checkIns: IPastoralCheckIn[];
    meta?: IBaseResponse["meta"];
  }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/check-ins", {
      params,
    });
    return {
      checkIns: extractArray<IPastoralCheckIn>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async getCheckInById(id: string): Promise<IPastoralCheckIn> {
    const res = await apiClient.get<
      IBaseResponse<IPastoralCheckIn> | IPastoralCheckIn
    >(`/check-ins/${id}`);
    return extractData<IPastoralCheckIn>(res.data);
  },

  async createCheckIn(
    payload: ICreateCheckInPayload,
  ): Promise<IPastoralCheckIn> {
    const res = await apiClient.post<
      IBaseResponse<IPastoralCheckIn> | IPastoralCheckIn
    >("/check-ins", payload);
    return extractData<IPastoralCheckIn>(res.data);
  },

  async updateCheckIn(
    id: string,
    payload: IUpdateCheckInPayload,
  ): Promise<IPastoralCheckIn> {
    const res = await apiClient.patch<
      IBaseResponse<IPastoralCheckIn> | IPastoralCheckIn
    >(`/check-ins/${id}`, payload);
    return extractData<IPastoralCheckIn>(res.data);
  },

  async completeCheckIn(
    id: string,
    outcome: string,
  ): Promise<IPastoralCheckIn> {
    return this.updateCheckIn(id, {
      status: "COMPLETED",
      outcome,
    });
  },

  async cancelCheckIn(id: string): Promise<IPastoralCheckIn> {
    return this.updateCheckIn(id, {
      status: "CANCELLED",
    });
  },
};
