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
export const listLatestFeedback = async () => {
  const res = await apiClient.get("/api/feedback/latest");
  return res.data;
};
export const getAllFeedback = async (params) => {
  const res = await apiClient.get(`${apiFeedback}/list`, { params });
  return res.data;
};

export const hideFeedback = async (id, isHidden) => {
  const res = await apiClient.patch(`${apiFeedback}/hide/${id}`, { isHidden });
  return res.data;
};

export const replyFeedback = async (id, content) => {
  const res = await apiClient.post(`${apiFeedback}/reply/${id}`, { content });
  return res.data;
};

export const deleteFeedback = async (id) => {
  const res = await apiClient.delete(`${apiFeedback}/delete/${id}`);
  return res.data;
};