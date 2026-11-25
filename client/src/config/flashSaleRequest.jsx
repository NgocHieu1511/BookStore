import request from "./request";
const api = "/api/flash-sale";

export const getFlashSale = async () => (await request.get(api)).data;
export const createFlashSale = async (data) => (await request.post(api, data)).data;
export const deleteFlashSale = async (id) => (await request.delete(`${api}/${id}`)).data;