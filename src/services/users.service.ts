import { apiClient } from "@/utils/api-client";
import { AdminUser, IUpdateUserPayload } from "@/models/dashboard";
import {
  IBaseResponse,
  IQueryParams,
  extractArray,
  extractData,
  extractMeta,
} from "@/models/base";

export const usersService = {
  async getUsers(
    params?: IQueryParams,
  ): Promise<{ users: AdminUser[]; meta?: IBaseResponse["meta"] }> {
    const res = await apiClient.get<IBaseResponse<unknown>>("/users", {
      params,
    });
    const rawUsers = extractArray<Record<string, unknown>>(res.data);
    const meta = extractMeta(res.data);

    const users = rawUsers.map((u) => {
      const userRoles =
        (u.userRoles as Array<{ role?: { name: string } }>) || [];
      const roleName =
        userRoles.length > 0 && userRoles[0].role
          ? userRoles[0].role.name
          : (u.role as string) || "MEMBER";

      const firstName = (u.firstName as string) || "";
      const lastName = (u.lastName as string) || "";
      const fullName =
        `${firstName} ${lastName}`.trim() ||
        (u.name as string) ||
        (u.email as string);

      return {
        id: (u.id as string) || "",
        name: fullName,
        firstName,
        lastName,
        email: (u.email as string) || "",
        phone: (u.phone as string) || "",
        role: roleName,
        status: (u.isActive !== false ? "Active" : "Inactive") as
          "Active" | "Inactive",
        lastActive: u.updatedAt
          ? new Date(u.updatedAt as string).toLocaleDateString()
          : "Recently",
      };
    });

    return { users, meta };
  },

  async updateUser(
    id: string,
    payload: IUpdateUserPayload,
  ): Promise<AdminUser> {
    const res = await apiClient.patch<IBaseResponse<unknown>>(
      `/users/${id}`,
      payload,
    );
    const u = extractData<Record<string, unknown>>(res.data);

    const userRoles = (u.userRoles as Array<{ role?: { name: string } }>) || [];
    const roleName =
      userRoles.length > 0 && userRoles[0].role
        ? userRoles[0].role.name
        : (u.role as string) || payload.role || "MEMBER";

    const firstName = (u.firstName as string) || payload.firstName || "";
    const lastName = (u.lastName as string) || payload.lastName || "";
    const fullName =
      `${firstName} ${lastName}`.trim() ||
      (u.name as string) ||
      (u.email as string) ||
      "User";

    return {
      id: (u.id as string) || id,
      name: fullName,
      firstName,
      lastName,
      email: (u.email as string) || payload.email || "",
      phone: (u.phone as string) || payload.phone || "",
      role: roleName,
      status: u.isActive !== false ? "Active" : "Inactive",
      lastActive: "Just now",
    };
  },
};
