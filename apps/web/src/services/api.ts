import axios from "axios";
import toast from "react-hot-toast";
import {
  ChurchSettings,
  IApiEvent,
  IRegisterPayload,
  IApiRegistration,
  IBaseResponse,
} from "@olive/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const webApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractServerMessage(resData: unknown, defaultMsg: string): string {
  if (!resData || typeof resData !== "object") return defaultMsg;
  const dataObj = resData as Record<string, unknown>;

  if (typeof dataObj.message === "string" && dataObj.message.trim()) {
    return dataObj.message.trim();
  }

  if (
    dataObj.data &&
    typeof dataObj.data === "object" &&
    dataObj.data !== null
  ) {
    const innerData = dataObj.data as Record<string, unknown>;
    if (typeof innerData.message === "string" && innerData.message.trim()) {
      return innerData.message.trim();
    }

    if (
      innerData.data &&
      typeof innerData.data === "object" &&
      innerData.data !== null
    ) {
      const deepInnerData = innerData.data as Record<string, unknown>;
      if (
        typeof deepInnerData.message === "string" &&
        deepInnerData.message.trim()
      ) {
        return deepInnerData.message.trim();
      }
    }
  }

  return defaultMsg;
}

function extractErrorMessage(
  error: unknown,
  defaultMsg = "Request failed",
): string {
  if (!error || typeof error !== "object") return defaultMsg;
  const errObj = error as { message?: string; response?: { data?: unknown } };
  const resData = errObj.response?.data;

  if (resData && typeof resData === "object") {
    const dataObj = resData as Record<string, unknown>;

    if (Array.isArray(dataObj.message) && dataObj.message.length > 0) {
      const validMsgs = dataObj.message.filter(
        (m): m is string => typeof m === "string" && m.trim().length > 0,
      );
      if (validMsgs.length > 0) return validMsgs.join(", ");
    }

    if (
      dataObj.data &&
      typeof dataObj.data === "object" &&
      dataObj.data !== null
    ) {
      const innerData = dataObj.data as Record<string, unknown>;
      if (Array.isArray(innerData.message) && innerData.message.length > 0) {
        const validMsgs = innerData.message.filter(
          (m): m is string => typeof m === "string" && m.trim().length > 0,
        );
        if (validMsgs.length > 0) return validMsgs.join(", ");
      }
      if (typeof innerData.message === "string" && innerData.message.trim()) {
        return innerData.message.trim();
      }
    }

    if (typeof dataObj.message === "string" && dataObj.message.trim()) {
      return dataObj.message.trim();
    }

    if (typeof dataObj.error === "string" && dataObj.error.trim()) {
      return dataObj.error.trim();
    }

    if (
      dataObj.error &&
      typeof dataObj.error === "object" &&
      dataObj.error !== null
    ) {
      const errProp = dataObj.error as Record<string, unknown>;
      if (typeof errProp.message === "string" && errProp.message.trim()) {
        return errProp.message.trim();
      }
    }
  }

  if (typeof errObj.message === "string" && errObj.message.trim()) {
    return errObj.message.trim();
  }

  return defaultMsg;
}

webApiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const serverMessage = extractServerMessage(
        response.data,
        "Operation completed successfully",
      );
      toast.success(serverMessage);
    }
    return response;
  },
  (error) => {
    const errorMessage = extractErrorMessage(error, "Request failed");
    toast.error(errorMessage);
    return Promise.reject(error);
  },
);

export const webService = {
  // Fetch Church Public Settings
  async getSettings(): Promise<ChurchSettings> {
    try {
      const res = await webApiClient.get<IBaseResponse<unknown>>("/settings");
      const data =
        (res.data?.data as Record<string, unknown>) || res.data || {};

      return {
        churchName:
          (data.name as string) ||
          (data.churchName as string) ||
          "Grace City Church",
        branchName: (data.branchName as string) || "",
        campusName: (data.campusName as string) || "Main Campus",
        address: (data.address as string) || "123 Hope Boulevard, Cityville",
        phone: (data.phone as string) || "+1 (555) 234-5678",
        email: (data.email as string) || "contact@gracecity.org",
        website:
          (data.websiteUrl as string) ||
          (data.website as string) ||
          "https://gracecity.org",
        branding: {
          primaryColor:
            (data.branding as Record<string, string>)?.primaryColor ||
            "#10b981",
          logoText:
            (data.branding as Record<string, string>)?.logoText || "GRACE CITY",
          heroHeadline:
            (data.branding as Record<string, string>)?.heroHeadline ||
            "Welcome Home to Grace City",
          heroSubtitle:
            (data.branding as Record<string, string>)?.heroSubtitle ||
            "A vibrant community dedicated to worship, growth, and loving our neighbors.",
        },
      };
    } catch {
      return {
        churchName: "Grace City Church",
        campusName: "Main Campus",
        address: "123 Hope Boulevard, Cityville",
        phone: "+1 (555) 234-5678",
        email: "contact@gracecity.org",
        website: "https://gracecity.org",
        branding: {
          primaryColor: "#10b981",
          logoText: "GRACE CITY",
          heroHeadline: "Welcome Home to Grace City",
          heroSubtitle:
            "A vibrant community dedicated to worship, growth, and loving our neighbors.",
        },
      };
    }
  },

  // Fetch Published Events
  async getPublishedEvents(): Promise<IApiEvent[]> {
    try {
      const res = await webApiClient.get<IBaseResponse<unknown>>("/events", {
        params: { status: "PUBLISHED" },
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return data as IApiEvent[];
      }
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        Array.isArray((data as { items: unknown[] }).items)
      ) {
        return (data as { items: IApiEvent[] }).items;
      }
      if (
        data &&
        typeof data === "object" &&
        "events" in data &&
        Array.isArray((data as { events: unknown[] }).events)
      ) {
        return (data as { events: IApiEvent[] }).events;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Fetch Event Details by ID
  async getEventById(id: string): Promise<IApiEvent | null> {
    try {
      const res = await webApiClient.get<IBaseResponse<IApiEvent> | IApiEvent>(
        `/events/${id}`,
      );
      const data = res.data;
      if ("data" in data && data.data) {
        return data.data;
      }
      return data as IApiEvent;
    } catch {
      return null;
    }
  },

  // Submit Event Registration
  async registerForEvent(
    eventId: string,
    payload: IRegisterPayload,
  ): Promise<IApiRegistration> {
    const res = await webApiClient.post<
      IBaseResponse<IApiRegistration> | IApiRegistration
    >(`/events/${eventId}/register`, payload);
    const data = res.data;
    if ("data" in data && data.data) {
      return data.data;
    }
    return data as IApiRegistration;
  },
};
