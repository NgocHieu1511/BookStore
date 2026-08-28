import request from "./request";
const apiUser = "api/user";
export const requestLogin = async (data) => {
  const res = await request.post(`${apiUser}/login`, data);
  return res.data;
};
