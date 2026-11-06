import { apiClient } from "@/utils/api-client";
import { extractArray, extractData } from "@/models/base";
import {
  ConfessionDetail,
  ConfessionListItem,
  ConfessionVoice,
  CreateConfessionPayload,
  ReorderConfessionsPayload,
  UpdateConfessionPayload,
} from "@/models/confession";

export const confessionsService = {
  /** Loads the whole library (drafts included) so it can be reordered in one go. */
  async getAll(): Promise<ConfessionListItem[]> {
    const res = await apiClient.get("/confessions", {
      params: { page: 1, limit: 200 },
    });
    return extractArray<ConfessionListItem>(res.data);
  },

  async getCategories(): Promise<string[]> {
    const res = await apiClient.get("/confessions/categories");
    return extractArray<string>(res.data);
  },

  async getById(idOrSlug: string): Promise<ConfessionDetail> {
    const res = await apiClient.get(`/confessions/${idOrSlug}`);
    return extractData<ConfessionDetail>(res.data);
  },

  async create(payload: CreateConfessionPayload): Promise<ConfessionDetail> {
    const res = await apiClient.post("/confessions", payload);
    return extractData<ConfessionDetail>(res.data);
  },

  async update(
    id: string,
    payload: UpdateConfessionPayload,
  ): Promise<ConfessionDetail> {
    const res = await apiClient.patch(`/confessions/${id}`, payload);
    return extractData<ConfessionDetail>(res.data);
  },

  async reorder(
    payload: ReorderConfessionsPayload,
  ): Promise<{ reordered: number }> {
    const res = await apiClient.patch("/confessions/reorder", payload);
    return extractData<{ reordered: number }>(res.data);
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete(`/confessions/${id}`);
    return extractData<{ message: string }>(res.data);
  },

  async uploadAudio(
    id: string,
    voice: ConfessionVoice,
    file: File,
  ): Promise<ConfessionDetail> {
    const formData = new FormData();
    formData.append("file", file);
    // Leave Content-Type unset so the browser adds the multipart boundary.
    const res = await apiClient.put(
      `/confessions/${id}/audio/${voice}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return extractData<ConfessionDetail>(res.data);
  },

  async deleteAudio(
    id: string,
    voice: ConfessionVoice,
  ): Promise<{ message: string }> {
    const res = await apiClient.delete(`/confessions/${id}/audio/${voice}`);
    return extractData<{ message: string }>(res.data);
  },
};
