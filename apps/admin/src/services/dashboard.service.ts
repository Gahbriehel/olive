import { apiClient } from "@/utils/api-client";
import { IDashboardData } from "@/models/dashboard";
import { IBaseResponse, extractData } from "@/models/base";

export const dashboardService = {
  async getDashboardData(): Promise<IDashboardData> {
    const res = await apiClient.get<
      IBaseResponse<IDashboardData> | IDashboardData
    >("/dashboard");
    return extractData<IDashboardData>(res.data);
  },
};
