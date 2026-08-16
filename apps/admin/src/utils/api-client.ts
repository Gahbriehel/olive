import axios from "axios";
import { customToast } from "@/helpers/customToast";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header if token exists and clean query parameters
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.params && typeof config.params === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      config.params as Record<string, unknown>,
    )) {
      if (value !== "" && value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
    config.params = cleaned;
  }

  return config;
});

/**
 * Safely extracts server success message from various API response shapes:
 * - { message: "..." }
 * - { data: { message: "..." } }
 * - { data: { data: { message: "..." } } }
 */
export function extractServerMessage(
  resData: unknown,
  defaultMsg: string,
): string {
  if (!resData || typeof resData !== "object") return defaultMsg;

  const dataObj = resData as Record<string, unknown>;

  // 1. Direct string message on response root
  if (typeof dataObj.message === "string" && dataObj.message.trim()) {
    return dataObj.message.trim();
  }

  // 2. Nested message inside data object (e.g. response.data.data.message)
  if (
    dataObj.data &&
    typeof dataObj.data === "object" &&
    dataObj.data !== null
  ) {
    const innerData = dataObj.data as Record<string, unknown>;
    if (typeof innerData.message === "string" && innerData.message.trim()) {
      return innerData.message.trim();
    }

    // 3. Deeply nested message (e.g. response.data.data.data.message)
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

/**
 * Safely extracts server error message from various Axios error shapes:
 * - NestJS validation array: { message: ["...", "..."] }
 * - Direct string message: { message: "..." }
 * - Nested data message: { data: { message: "..." } }
 * - Error string or object: { error: "..." } or { error: { message: "..." } }
 * - Axios error message
 */
export function extractErrorMessage(
  error: unknown,
  defaultMsg = "Server request failed",
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

    // 1. Handle array of validation messages (e.g. NestJS class-validator)
    if (Array.isArray(dataObj.message) && dataObj.message.length > 0) {
      const validMsgs = dataObj.message.filter(
        (m): m is string => typeof m === "string" && m.trim().length > 0,
      );
      if (validMsgs.length > 0) {
        return validMsgs.join(", ");
      }
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
        if (validMsgs.length > 0) {
          return validMsgs.join(", ");
        }
      }
    }

    // 2. Direct string message at root of response data
    if (typeof dataObj.message === "string" && dataObj.message.trim()) {
      const msg = dataObj.message.trim();
      if (!/^Request failed with status code/i.test(msg)) {
        return msg;
      }
    }

    // 3. Nested string message in resData.data.message
    if (
      dataObj.data &&
      typeof dataObj.data === "object" &&
      dataObj.data !== null
    ) {
      const innerData = dataObj.data as Record<string, unknown>;
      if (typeof innerData.message === "string" && innerData.message.trim()) {
        const msg = innerData.message.trim();
        if (!/^Request failed with status code/i.test(msg)) {
          return msg;
        }
      }
    }

    // 4. Direct error property (string or object with message)
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
    return "Session expired or unauthorized. Please sign in again.";
  }
  if (status === 403 || (isStatusMessage && rawMsg.includes("403"))) {
    return "You do not have administrative permission to perform this action.";
  }
  if (status === 404 || (isStatusMessage && rawMsg.includes("404"))) {
    return "The requested resource could not be found.";
  }
  if (status === 409 || (isStatusMessage && rawMsg.includes("409"))) {
    return "Conflict occurred. The requested item or record already exists.";
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

  // 5. Fallback to generic Axios error message if not raw status text
  if (rawMsg && !isStatusMessage) {
    return rawMsg;
  }

  return defaultMsg;
}

// Response interceptor to handle token refresh / 401 redirect & toasts for server responses
let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    const url = response.config.url || "";
    const isMutation =
      method && ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (
      isMutation &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/me")
    ) {
      const defaultFallback =
        method === "POST"
          ? "Successfully created"
          : method === "DELETE"
            ? "Successfully deleted"
            : "Successfully saved changes";

      const serverMessage = extractServerMessage(
        response.data,
        defaultFallback,
      );
      customToast.success(serverMessage);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // Show red error toast for server response failures
    if (error.response?.status === 403) {
      const errorMessage = extractErrorMessage(
        error,
        "You do not have administrative permission to perform this action.",
      );
      customToast.error(errorMessage);
    } else if (!url.includes("/auth/refresh")) {
      const errorMessage = extractErrorMessage(error, "Server request failed");
      customToast.error(errorMessage);
    }

    // Ignore authentication action endpoints (login, change-password) for session refresh/logout handling
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/change-password")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const rawData = data?.data || data;
          const newAccessToken =
            rawData?.accessToken ||
            rawData?.tokens?.accessToken ||
            rawData?.access_token;
          const newRefreshToken =
            rawData?.refreshToken ||
            rawData?.tokens?.refreshToken ||
            rawData?.refresh_token;

          if (newAccessToken) {
            setTokens(newAccessToken, newRefreshToken);
            isRefreshing = false;
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch {
          isRefreshing = false;
        }
      }

      // If refresh fails or no token, clear & redirect to /login
      clearTokens();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
