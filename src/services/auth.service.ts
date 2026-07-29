import { apiClient } from "@/utils/api-client";
import {
  ILoginPayload,
  ISignUpPayload,
  IAuthResponse,
  ISignUpResponse,
  IUser,
} from "@/models/auth";
import { IBaseResponse } from "@/models/base";

function extractData<T>(resData: IBaseResponse<T> | T): T {
  if (resData && typeof resData === "object" && "data" in resData) {
    return (resData as IBaseResponse<T>).data;
  }
  return resData as T;
}

export const authService = {
  async login(payload: ILoginPayload): Promise<IAuthResponse> {
    const res = await apiClient.post<
      IBaseResponse<IAuthResponse> | IAuthResponse
    >("/auth/login", payload);
    return extractData(res.data);
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
      IBaseResponse<IAuthResponse> | IAuthResponse
    >("/auth/refresh", { refreshToken: token });
    return extractData(res.data);
  },
};
