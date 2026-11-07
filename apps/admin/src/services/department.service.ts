import { apiClient } from "@/utils/api-client";
import {
  IDepartment,
  ICreateDepartmentPayload,
  IUpdateDepartmentPayload,
  IAssignDepartmentMemberPayload,
} from "@/models/department";
import {
  IBaseResponse,
  IQueryParams,
  extractData,
  extractArray,
  extractMeta,
} from "@/models/base";

export const departmentService = {
  async getDepartments(params?: IQueryParams): Promise<{
    departments: IDepartment[];
    meta?: IBaseResponse["meta"];
  }> {
    const res = await apiClient.get<
      IBaseResponse<IDepartment[]> | IDepartment[]
    >("/departments", { params });
    return {
      departments: extractArray<IDepartment>(res.data),
      meta: extractMeta(res.data),
    };
  },

  async getDepartmentById(id: string): Promise<IDepartment> {
    const res = await apiClient.get<IBaseResponse<IDepartment> | IDepartment>(
      `/departments/${id}`,
    );
    return extractData<IDepartment>(res.data);
  },

  async createDepartment(
    payload: ICreateDepartmentPayload,
  ): Promise<IDepartment> {
    const res = await apiClient.post<IBaseResponse<IDepartment> | IDepartment>(
      "/departments",
      payload,
    );
    return extractData<IDepartment>(res.data);
  },

  async updateDepartment(
    id: string,
    payload: IUpdateDepartmentPayload,
  ): Promise<IDepartment> {
    const res = await apiClient.patch<IBaseResponse<IDepartment> | IDepartment>(
      `/departments/${id}`,
      payload,
    );
    return extractData<IDepartment>(res.data);
  },

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },

  async addMember(
    departmentId: string,
    payload: IAssignDepartmentMemberPayload,
  ): Promise<void> {
    await apiClient.post(`/departments/${departmentId}/members`, payload);
  },

  async removeMember(departmentId: string, personId: string): Promise<void> {
    await apiClient.delete(`/departments/${departmentId}/members/${personId}`);
  },
};
