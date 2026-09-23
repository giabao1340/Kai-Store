import { DashboardRange, DashboardResponse } from "@/types/dashboard";
import api from "./api";

export const dashboardService = {
  async getDashboard(
    range: DashboardRange = "30d",
  ): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>("/admin/dashboard", {
      params: {
        range,
      },
    });

    return response;
  },
};
