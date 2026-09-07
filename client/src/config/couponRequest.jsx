import request from "./request";
const apiCoupon = "/api/coupon";
export const listCoupon = async () => {
  const res = await request.get(`${apiCoupon}/list`);
  return res.data;
};
