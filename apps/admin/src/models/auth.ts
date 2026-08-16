export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ISignUpPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  churchName?: string;
}

export interface IRole {
  id: string;
  name: string;
  description?: string;
}

export interface IUserRole {
  role: IRole;
}

export interface IUser {
  id: string;
  churchId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  churchName?: string;
  church?: {
    id: string;
    name: string;
  };
  userRoles?: IUserRole[];
  roles?: string[];
  role?: string;
  createdAt?: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: IUser;
}

export interface ISignUpResponse {
  message: string;
  user: IUser;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
