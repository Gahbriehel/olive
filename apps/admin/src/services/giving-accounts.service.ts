import { apiClient } from "@/utils/api-client";
import { extractArray, extractData } from "@/models/base";
import {
  GivingAccount,
  CreateGivingAccountPayload,
  UpdateGivingAccountPayload,
  ReorderGivingAccountsPayload,
} from "@/models/giving-account";

export const givingAccountsService = {
  async getAll(): Promise<GivingAccount[]> {
    const res = await apiClient.get("/giving-accounts");
    return extractArray<GivingAccount>(res.data);
  },

  async create(payload: CreateGivingAccountPayload): Promise<GivingAccount> {
    const res = await apiClient.post("/giving-accounts", payload);
    return extractData<GivingAccount>(res.data);
  },

  async update(
    id: string,
    payload: UpdateGivingAccountPayload,
  ): Promise<GivingAccount> {
    const res = await apiClient.patch(`/giving-accounts/${id}`, payload);
    return extractData<GivingAccount>(res.data);
  },

  async reorder(
    payload: ReorderGivingAccountsPayload,
  ): Promise<{ message: string }> {
    const res = await apiClient.patch("/giving-accounts/reorder", payload);
    return extractData<{ message: string }>(res.data);
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/giving-accounts/${id}`);
    return extractData<{ message: string }>(res.data);
  },
};
