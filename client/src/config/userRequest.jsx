import request from "./request";
const apiUser = "api/user";
import { apiClient } from './axiosClient';
export const requestLogin = async (data) => {
  const res = await request.post(`${apiUser}/login`, data);
  return res.data;
};
export const requestRegister = async (data) => {
    const res = await request.post(`${apiUser}/register`, data);
    return res.data;
};
export const requestAuth = async () => {
    const res = await apiClient.get(`${apiUser}/auth`);
    
    return res.data;
    
};
export const requestLogout = async () => {
    const res = await apiClient.get(`${apiUser}/logout`);
    return res.data;
};
export const requestForgotPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/forgot-password`, data);
    return res.data;
}
export const requestVerifyForgotPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/verify-forgot-password`, data);
    return res.data;
}
export const requestRefreshToken = async () => {
    const res = await request.get(`${apiUser}/refresh-token`);
    return res.data;
};
export const requestLoginGoogle = async (tokenGoogle) => {
    const res = await request.post(`${apiUser}/login-google`, {
        tokenGoogle: tokenGoogle,
    });
    return res.data;
};

export const requestGetAllUser = async (params) => {
    const res = await apiClient.get(`${apiUser}/list`, { params });
    return res.data;
};

export const requestLockUser = async (id, isBlocked) => {
    const res = await apiClient.patch(`${apiUser}/lock/${id}`, { isBlocked });
    return res.data;
};
