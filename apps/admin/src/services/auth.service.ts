import { apiClient } from "@/utils/api-client";
import {
  ILoginPayload,
  ISignUpPayload,
  IAuthResponse,
  ISignUpResponse,
  IUser,
  IChangePasswordPayload,
} from "@/models/auth";
import { IBaseResponse, extractData } from "@/models/base";

interface RawAuthResponsePayload {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
  };
  user?: IUser;
  [key: string]: unknown;
}

export const authService = {
  async login(payload: ILoginPayload): Promise<IAuthResponse> {
    const res = await apiClient.post<
      IBaseResponse<RawAuthResponsePayload> | RawAuthResponsePayload
    >("/auth/login", payload);
    const rawData = extractData<RawAuthResponsePayload>(res.data);

    const accessToken =
      rawData?.accessToken ||
      rawData?.tokens?.accessToken ||
      rawData?.access_token ||
      rawData?.tokens?.access_token ||
      "";

    const refreshToken =
      rawData?.refreshToken ||
      rawData?.tokens?.refreshToken ||
      rawData?.refresh_token ||
      rawData?.tokens?.refresh_token ||
      "";

    const user = (rawData?.user || rawData) as IUser;

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  async register(payload: ISignUpPayload): Promise<ISignUpResponse> {
    const res = await apiClient.post<
      IBaseResponse<ISignUpResponse> | ISignUpResponse
    >("/auth/register", payload);
    return extractData(res.data);
  },

  async getProfile(): Promise<IUser> {
    const res = await apiClient.get<IBaseResponse<IUser> | IUser>(
      "/auth/profile",
    );
    return extractData(res.data);
  },

  async refreshToken(token: string): Promise<IAuthResponse> {
    const res = await apiClient.post<
      IBaseResponse<RawAuthResponsePayload> | RawAuthResponsePayload
    >("/auth/refresh", {
      refreshToken: token,
    });
    const rawData = extractData<RawAuthResponsePayload>(res.data);

    const accessToken =
      rawData?.accessToken ||
      rawData?.tokens?.accessToken ||
      rawData?.access_token ||
      "";

    const refreshToken =
      rawData?.refreshToken ||
      rawData?.tokens?.refreshToken ||
      rawData?.refresh_token ||
      token;

    const user = rawData?.user;

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  async changePassword(payload: IChangePasswordPayload): Promise<unknown> {
    const res = await apiClient.post<IBaseResponse<unknown> | unknown>(
      "/auth/change-password",
      payload,
    );
    return extractData(res.data);
  },
};
