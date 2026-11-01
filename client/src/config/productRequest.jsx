import request from "./request";
const apiProduct = "/api/product";
export const listProducts = async () => {
  const res = await request.get(`${apiProduct}/list`);
  return res.data;
};
export const productDetail = async (idProduct) => {
  const res = await request.get(`${apiProduct}/detail/${idProduct}`);
  return res.data;
};
// Thêm sản phẩm
export const createProduct = async (formData) => {
const res = await request.post(`${apiProduct}/create`, formData);
return res.data;
};

// Cập nhật sản phẩm
export const updateProduct = async (idProduct, formData) => {
    const res = await request.put(`${apiProduct}/update/${idProduct}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// Xóa sản phẩm
export const deleteProduct = async (idProduct) => {
const res = await request.delete(`${apiProduct}/delete/${idProduct}`);
return res.data;};

// Lấy danh sách sản phẩm theo danh mục
export const getProductsByCategory = async (idCategory) => {
const res = await request.get(`${apiProduct}/list/${idCategory}`);
return res.data;
};