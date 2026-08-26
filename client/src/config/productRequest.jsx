import request from "./request";
const apiProduct = "/api/product";
export const listProducts = async () => {
  const res = await request.get(`${apiProduct}/list`);
  return res.data;
};
