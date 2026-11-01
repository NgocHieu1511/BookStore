
import request from "./request";

const apiCoupon = "/api/coupon";

// Lấy danh sách coupon
export const listCoupon = async () => {
  const res = await request.get(`${apiCoupon}/list`);
  return res.data;
};

// Thêm coupon
export const createCoupon = async (data) => {
  const res = await request.post(`${apiCoupon}/create`, data);
  return res.data;
};

// Sửa coupon theo ID
export const updateCoupon = async (id, data) => {
  const res = await request.put(`${apiCoupon}/update/${id}`, data);
  return res.data;
};

// Xóa coupon theo ID
export const deleteCoupon = async (id) => {
  const res = await request.delete(`${apiCoupon}/delete/${id}`);
  return res.data;
};
