import { apiClient } from "@/utils/api-client";
import { IBaseResponse } from "@/models/base";

export const uploadsService = {
  async uploadFlyer(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<
      IBaseResponse<{ url: string }> | { url: string }
    >("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = res.data;
    let url = "";
    if (
      "data" in data &&
      data.data &&
      typeof data.data === "object" &&
      "url" in data.data
    ) {
      url = data.data.url;
    } else if ("url" in data) {
      url = data.url;
    }

    if (!url) {
      throw new Error("Invalid response from upload server");
    }

    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const serverHost = apiBase.replace(/\/api\/v1\/?$/, "");

    if (url.startsWith("/")) {
      return `${serverHost}${url}`;
    }
    return url;
  },
};
