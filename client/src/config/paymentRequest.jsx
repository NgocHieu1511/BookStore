
import { apiClient } from './axiosClient';

const apiPayment = '/api/payment';

export const requestPayment = async (data) => {
    const res = await apiClient.post(`${apiPayment}/create`, data);
    return res.data;
};

export const requestPaymentById = async (orderId) => {
    const res = await apiClient.get(`${apiPayment}/order/${orderId}`);
    return res.data;
};
// ADMIN: Lấy danh sách đơn hàng
export const requestAdminPaymentList = async (params = {}) => {
  const res = await apiClient.get("/api/payment/admin/list", {
    params,
  });

  return res.data;
};

// ADMIN: Cập nhật trạng thái đơn hàng
export const requestUpdatePaymentStatus = async (
  orderId,
  status,note
) => {
  const res = await apiClient.put(
    `/api/payment/admin/update/${orderId}`,
    { status, note }
  );
  

  return res.data;
};
// ADMIN: Lấy chi tiết đơn hàng
export const requestAdminPaymentDetail = async (orderId) => {
  const res = await apiClient.get(
    `/api/payment/admin/detail/${orderId}`
  );

  return res.data;
};
  
// Lấy danh sách đơn hàng của khách hàng đang đăng nhập
export const requestMyPayments = async (status) => {
  const res = await apiClient.get("/api/payment/my-orders", {
        params: { status },
    });
  return res.data;
};
// KHÁCH HÀNG: Tự hủy đơn hàng
export const requestCancelMyPayment = async (orderId, note) => {
  const res = await apiClient.patch(`/api/payment/cancel/${orderId}`, { note });
  return res.data;
};