import axios from "axios";
import toast from "react-hot-toast";
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
      const serverMessage =
        response.data?.message ||
        (method === "POST"
          ? "Successfully created"
          : method === "DELETE"
            ? "Successfully deleted"
            : "Successfully saved changes");
      toast.success(serverMessage);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // Show red error toast for server response failures
    if (!url.includes("/auth/refresh")) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Server request failed";
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Server request failed",
      );
    }

    // Ignore login requests for refresh handling
    if (originalRequest?.url?.includes("/auth/login")) {
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
