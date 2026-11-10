import { apiClient } from "./axiosClient";

export const requestAskChatbot = async (data) => {
  // axiosClient mặc định timeout 10s, Gemini có thể chậm hơn nên nới ra 30s
  const res = await apiClient.post("/api/chatbot/ask", data, { timeout: 30000 });
  return res.data;
};