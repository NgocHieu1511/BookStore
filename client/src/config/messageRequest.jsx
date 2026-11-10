import { apiClient } from "./axiosClient";

const apiMessage = "/api/message";

export const requestCreateMessage = async (data) => {
  const res = await apiClient.post(`${apiMessage}/create`, data);
  return res.data;
};

// Khách: gọi không tham số. Admin: truyền userId của khách.
export const requestGetMessages = async (userId) => {
  const res = await apiClient.get(`${apiMessage}/list`, { params: { userId } });
  return res.data;
};

export const requestGetConversations = async () => {
  const res = await apiClient.get(`${apiMessage}/conversations`);
  return res.data;
};