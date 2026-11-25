import { apiClient } from "./axiosClient";
const apiStatistical = "/api/statistical";
// ADMIN: Lấy số liệu tổng quan cho Dashboard
export const requestGetOverview = async () => {
  const res = await apiClient.get(`${apiStatistical}/overview`);
  return res.data;
};
