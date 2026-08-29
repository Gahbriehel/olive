import axios from "axios";
import { customToast } from "../helpers/customToast";
import {
  IChurchSettings,
  IEventResponse,
  IRegistrationPayload,
  IRegistrationResponse,
  IBaseResponse,
  ILeaderboardEntry,
  ILeaderboardResponse,
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
  const errObj = error as {
    message?: string;
    response?: { data?: unknown; status?: number };
  };
  const resData = errObj.response?.data;
  const status = errObj.response?.status;

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
        const msg = innerData.message.trim();
        if (!/^Request failed with status code/i.test(msg)) {
          return msg;
        }
      }
    }

    if (typeof dataObj.message === "string" && dataObj.message.trim()) {
      const msg = dataObj.message.trim();
      if (!/^Request failed with status code/i.test(msg)) {
        return msg;
      }
    }

    if (typeof dataObj.error === "string" && dataObj.error.trim()) {
      const errStr = dataObj.error.trim();
      if (!/^Request failed with status code/i.test(errStr)) {
        return errStr;
      }
    }

    if (
      dataObj.error &&
      typeof dataObj.error === "object" &&
      dataObj.error !== null
    ) {
      const errProp = dataObj.error as Record<string, unknown>;
      if (typeof errProp.message === "string" && errProp.message.trim()) {
        const msg = errProp.message.trim();
        if (!/^Request failed with status code/i.test(msg)) {
          return msg;
        }
      }
    }
  }

  const rawMsg =
    typeof errObj.message === "string" ? errObj.message.trim() : "";
  const isStatusMessage = /^Request failed with status code/i.test(rawMsg);

  if (status === 401 || (isStatusMessage && rawMsg.includes("401"))) {
    return "Session expired or unauthorized. Please try signing in.";
  }
  if (status === 403 || (isStatusMessage && rawMsg.includes("403"))) {
    return "Access restricted. You do not have permission for this operation.";
  }
  if (status === 404 || (isStatusMessage && rawMsg.includes("404"))) {
    return "The requested resource could not be found.";
  }
  if (status === 409 || (isStatusMessage && rawMsg.includes("409"))) {
    return "Conflict occurred. The item or registration already exists.";
  }
  if (status === 422 || (isStatusMessage && rawMsg.includes("422"))) {
    return "Validation error. Please check your submission details.";
  }
  if (
    (status && status >= 500) ||
    (isStatusMessage && /50[0-9]/.test(rawMsg))
  ) {
    return "Internal server error. Please try again later.";
  }

  if (rawMsg && !isStatusMessage) {
    return rawMsg;
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
      customToast.success(serverMessage);
    }
    return response;
  },
  (error) => {
    const errorMessage = extractErrorMessage(error, "Request failed");
    customToast.error(errorMessage);
    return Promise.reject(error);
  },
);

export const webService = {
  // Fetch Church Public Settings
  async getSettings(): Promise<IChurchSettings> {
    try {
      const res = await webApiClient.get<IBaseResponse<unknown>>("/settings");
      const data =
        (res.data?.data as Record<string, unknown>) || res.data || {};

      return {
        churchName: (data.name as string) || (data.churchName as string) || "",
        branchName: (data.branchName as string) || "",
        campusName: (data.campusName as string) || "",
        address: (data.address as string) || "",
        phone: (data.phone as string) || "",
        email: (data.email as string) || "",
        website: (data.websiteUrl as string) || (data.website as string) || "",
        branding: {
          primaryColor:
            (data.branding as Record<string, string>)?.primaryColor || "",
          logoText: (data.branding as Record<string, string>)?.logoText || "",
          heroHeadline:
            (data.branding as Record<string, string>)?.heroHeadline || "",
          heroSubtitle:
            (data.branding as Record<string, string>)?.heroSubtitle || "",
        },
      };
    } catch {
      return {
        churchName: "",
        campusName: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        branding: {
          primaryColor: "",
          logoText: "",
          heroHeadline: "",
          heroSubtitle: "",
        },
      };
    }
  },

  // Fetch Published Events
  async getPublishedEvents(): Promise<IEventResponse[]> {
    try {
      const res = await webApiClient.get<IBaseResponse<unknown>>("/events", {
        params: { status: "PUBLISHED" },
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return data as IEventResponse[];
      }
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        Array.isArray((data as { items: unknown[] }).items)
      ) {
        return (data as { items: IEventResponse[] }).items;
      }
      if (
        data &&
        typeof data === "object" &&
        "events" in data &&
        Array.isArray((data as { events: unknown[] }).events)
      ) {
        return (data as { events: IEventResponse[] }).events;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Fetch Event Details by ID
  async getEventById(id: string): Promise<IEventResponse | null> {
    try {
      const res = await webApiClient.get<
        IBaseResponse<IEventResponse> | IEventResponse
      >(`/events/${id}`);
      const data = res.data;
      if ("data" in data && data.data) {
        return data.data;
      }
      return data as IEventResponse;
    } catch {
      return null;
    }
  },

  // Submit Event Registration
  async registerForEvent(
    eventId: string,
    payload: IRegistrationPayload,
  ): Promise<IRegistrationResponse> {
    const res = await webApiClient.post<
      IBaseResponse<IRegistrationResponse> | IRegistrationResponse
    >(`/events/${eventId}/register`, payload);
    const data = res.data;
    if ("data" in data && data.data) {
      return data.data;
    }
    return data as IRegistrationResponse;
  },

  // Fetch Event Leaderboard
  async getLeaderboard(eventId: string): Promise<ILeaderboardResponse> {
    try {
      const res = await webApiClient.get<unknown>(`/leaderboard/${eventId}`);
      const rawData = res.data as Record<string, unknown> | null;
      let dataObj = rawData;

      if (
        rawData &&
        typeof rawData === "object" &&
        "data" in rawData &&
        rawData.data
      ) {
        dataObj = rawData.data as Record<string, unknown>;
      }

      if (dataObj && typeof dataObj === "object") {
        const eventTitle =
          typeof dataObj.eventTitle === "string"
            ? dataObj.eventTitle
            : undefined;
        const respEventId =
          typeof dataObj.eventId === "string" ? dataObj.eventId : eventId;

        if ("leaderboard" in dataObj && Array.isArray(dataObj.leaderboard)) {
          return {
            eventId: respEventId,
            eventTitle,
            leaderboard: dataObj.leaderboard as ILeaderboardEntry[],
          };
        }
      }

      if (Array.isArray(rawData)) {
        return {
          eventId,
          leaderboard: rawData as ILeaderboardEntry[],
        };
      }

      return { eventId, leaderboard: [] };
    } catch {
      return { eventId, leaderboard: [] };
    }
  },
};
