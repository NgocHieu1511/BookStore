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
export const requestEditUser = async (data) => {
    const res = await apiClient.put(`${apiUser}/edit`, data);
    return res.data;
};
// Thêm / bỏ yêu thích sản phẩm (toggle)
export const requestHeartProduct = async (productId) => {
    const res = await apiClient.post(`${apiUser}/heart-product`, { productId });
    return res.data;
};

// Lấy mảng ID các sản phẩm đã yêu thích (dùng để đổi nút ở trang chi tiết)
export const requestGetHeartProduct = async () => {
    const res = await apiClient.get(`${apiUser}/get-heart-product`);
    return res.data;
};

// Lấy danh sách sản phẩm yêu thích đầy đủ (dùng cho trang Favorite)
export const requestGetHeartProductUser = async () => {
    const res = await apiClient.get(`${apiUser}/heart/detail`);
    return res.data;
};
// Thêm địa chỉ mới
export const requestCreateAddress = async (data) => {
    const res = await apiClient.post(`${apiUser}/address`, data);
    return res.data;
};

// Cập nhật địa chỉ
export const requestUpdateAddress = async (idAddress, data) => {
    const res = await apiClient.put(`${apiUser}/address/${idAddress}`, data);
    return res.data;
};

// Xóa địa chỉ
export const requestDeleteAddress = async (idAddress) => {
    const res = await apiClient.delete(`${apiUser}/address/${idAddress}`);
    return res.data;
};
// Tìm kiếm địa chỉ
export const requestSearchAddress = async (address) => {
    const res = await apiClient.get(`${apiUser}/search-address`, {
        params: {
            address: address,
        },
    });

    return res.data;
};