import { apiClient } from "./axiosClient";

const apiFeedback = "/api/feedback";

export const createFeedback = async (formData) => {
  const res = await apiClient.post(`${apiFeedback}/create`, formData, { timeout: 60000 });
  return res.data;
};

export const getMyFeedbacks = async () => {
  const res = await apiClient.get(`${apiFeedback}/my`);
  return res.data;
};