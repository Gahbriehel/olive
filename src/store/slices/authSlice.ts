import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IAuthResponse, ILoginPayload, IUser } from "@/models/auth";
import { authService } from "@/services/auth.service";
import { getAccessToken, clearTokens, setTokens } from "@/utils/token";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: getAccessToken(),
  isAuthenticated: !!getAccessToken(),
  isLoading: false,
  error: null,
};

interface ApiErrorShape {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
  message?: string;
}

export const loginUser = createAsyncThunk<
  IAuthResponse,
  ILoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    setTokens(data.accessToken, data.refreshToken);
    return data;
  } catch (err: unknown) {
    const apiErr = err as ApiErrorShape;
    const message =
      apiErr.response?.data?.message ||
      apiErr.message ||
      "Failed to authenticate";
    return rejectWithValue(
      Array.isArray(message) ? message.join(", ") : message,
    );
  }
});

export const fetchUserProfile = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const user = await authService.getProfile();
    return user;
  } catch (err: unknown) {
    const apiErr = err as ApiErrorShape;
    const message =
      apiErr.response?.data?.message ||
      apiErr.message ||
      "Failed to fetch profile";
    return rejectWithValue(
      Array.isArray(message) ? message.join(", ") : message,
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearTokens();
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      loginUser.fulfilled,
      (state, action: PayloadAction<IAuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user || null;
      },
    );
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload || "Login failed";
    });

    // Profile
    builder.addCase(
      fetchUserProfile.fulfilled,
      (state, action: PayloadAction<IUser>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      },
    );
    builder.addCase(fetchUserProfile.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      clearTokens();
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
