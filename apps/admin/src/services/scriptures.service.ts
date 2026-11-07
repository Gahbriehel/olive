import { apiClient } from "@/utils/api-client";
import { extractArray, extractData } from "@/models/base";
import {
  CreateScripturePayload,
  Scripture,
  ScriptureKind,
  UpdateScripturePayload,
} from "@/models/scripture";

export const scripturesService = {
  /** Every record of one kind (drafts and past included) so it can be grouped client-side. */
  async getByKind(kind: ScriptureKind): Promise<Scripture[]> {
    const res = await apiClient.get("/scriptures", {
      params: { kind, page: 1, limit: 100 },
    });
    return extractArray<Scripture>(res.data);
  },

  async create(payload: CreateScripturePayload): Promise<Scripture> {
    const res = await apiClient.post("/scriptures", payload);
    return extractData<Scripture>(res.data);
  },

  async update(
    id: string,
    payload: UpdateScripturePayload,
  ): Promise<Scripture> {
    const res = await apiClient.patch(`/scriptures/${id}`, payload);
    return extractData<Scripture>(res.data);
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/scriptures/${id}`);
    return extractData<{ message: string }>(res.data);
  },
};
