import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ILoginPayload } from "@/models/auth";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchUserProfile,
  loginUser,
  logout as logoutAction,
} from "@/store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: ILoginPayload) => {
      const result = await dispatch(loginUser(credentials));
      return result;
    },
    [dispatch],
  );

  const getProfile = useCallback(async () => {
    const result = await dispatch(fetchUserProfile());
    return result;
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    queryClient.clear();
  }, [dispatch, queryClient]);

  return {
    user: auth.user,
    accessToken: auth.accessToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    getProfile,
    logout,
  };
}
